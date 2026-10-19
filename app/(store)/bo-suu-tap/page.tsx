"use client";

import Link from "next/link";
import { CollectionCard, CollectionCardSkeleton, CollectionGrid } from "@/components/hsv/collection-card";
import { Breadcrumbs, TitleOrnament } from "@/components/hsv/store-ui";
import { EmptyState, ErrorBox } from "@/components/hsv/ui";
import { useApi } from "@/hooks/use-api";
import { collectionApi } from "@/lib/api/services";

/** Danh sách bộ sưu tập do cửa hàng tạo trong trang quản trị (chỉ bộ đang hiển thị). */
export default function CollectionsPage() {
  const { data, error, reload } = useApi(() => collectionApi.getAll(), []);
  const items = data?.items;

  return (
    <div className="animate-hin pb-16">
      <div className="hsv-container pt-5">
        <Breadcrumbs items={[{ label: "Bộ sưu tập" }]} className="text-center" />
        <div className="mb-8 mt-7 text-center sm:mb-10">
          <h1 className="hsv-section-title">Bộ sưu tập</h1>
          <TitleOrnament />
          <p className="mx-auto mt-3 max-w-[560px] text-[14px] font-light leading-relaxed text-subtle">
            Những nhóm sản phẩm Hồn Sừng Việt tuyển chọn theo chủ đề — quà tặng, đồ dùng hằng ngày, trang sức thủ công.
          </p>
        </div>

        {error && !items ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : items && items.length === 0 ? (
          <EmptyState
            title="Bộ sưu tập đang được chuẩn bị"
            desc="Trong lúc chờ, mời bạn xem toàn bộ sản phẩm của cửa hàng."
            action={
              <Link href="/products" className="hsv-btn-primary h-11">
                Xem tất cả sản phẩm
              </Link>
            }
          />
        ) : (
          <CollectionGrid>
            {items ? items.map((c) => <CollectionCard key={c.id} c={c} />) : Array.from({ length: 3 }, (_, i) => <CollectionCardSkeleton key={i} />)}
          </CollectionGrid>
        )}
      </div>
    </div>
  );
}
