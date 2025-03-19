import { Metadata } from 'next/types';
import { INFINITE_SCROLL_GRID_INITIAL } from '@/photo';
import { cache } from 'react';
import { getUniqueLenses } from '@/photo/db/query';
import { generateMetaForLens } from '@/lens/meta';
import { getPhotosLensDataCached } from '@/lens/data';
import LensOverview from '@/lens/LensOverview';
import {
  getLensFromParams,
  Lens,
  LensProps,
  safelyGenerateLensStaticParams,
} from '@/lens';
import {
  shouldGenerateStaticParamsForCategory,
  staticallyGenerateCategory,
} from '@/category/server';

const getPhotosLensDataCachedCached = cache((
  make: string | undefined,
  model: string,
) => getPhotosLensDataCached(
  make,
  model,
  INFINITE_SCROLL_GRID_INITIAL,
));

export let generateStaticParams:
  (() => Promise<Lens[]>) | undefined = undefined;

if (shouldGenerateStaticParamsForCategory('lenses', 'page')) {
  generateStaticParams = () =>
    staticallyGenerateCategory(
      'lenses',
      'page',
      getUniqueLenses,
      safelyGenerateLensStaticParams,
    );
}

export async function generateMetadata({
  params,
}: LensProps): Promise<Metadata> {
  const { make, model } = await getLensFromParams(params);

  const [
    photos,
    { count, dateRange },
    lens,
  ] = await getPhotosLensDataCachedCached(make, model);

  const {
    url,
    title,
    description,
    images,
  } = generateMetaForLens(lens, photos, count, dateRange);

  return {
    title,
    openGraph: {
      title,
      description,
      images,
      url,
    },
    twitter: {
      images,
      description,
      card: 'summary_large_image',
    },
    description,
  };
}

export default async function LensPage({
  params,
}: LensProps) {
  const { make, model } = await getLensFromParams(params);

  const [
    photos,
    { count, dateRange },
    lens,
  ] = await getPhotosLensDataCachedCached(make, model);

  return (
    <LensOverview {...{ lens, photos, count, dateRange }} />
  );
}
