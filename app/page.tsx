import { Suspense } from "react";
import { Splash } from "./components/Splash";
import { Hero } from "./components/Hero";
import { Gallery } from "./components/Gallery";
import { UploadSheet } from "./components/UploadSheet";
import { countDistinctGuests, getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ upload?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const photos = await getPhotos();
  const { upload } = await searchParams;
  const guestCount = countDistinctGuests(photos);
  return (
    <>
      <Splash />
      <Hero photoCount={photos.length} guestCount={guestCount} galleryHref="#galleria" />
      <Gallery initialPhotos={photos} />
      {upload === "1" && (
        <Suspense>
          <UploadSheet />
        </Suspense>
      )}
    </>
  );
}
