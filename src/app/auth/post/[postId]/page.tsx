"use client";

import PostModal from "@/components/PostModal";
import { use } from "react";

type PageProps = {
  params: Promise<{ postId: string }>;
};

export default function SinglePostPage({ params }: PageProps) {
  const { postId } = use(params);

  return <PostModal postId={postId} fullPage />;
}
