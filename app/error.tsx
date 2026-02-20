'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[UnexpectedError]', {
      message: error.message,
      timestamp: new Date().toISOString(),
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="text-center py-24">
      <p className="text-5xl font-bold text-[rgba(8,19,26,0.14)] mb-6">500</p>
      <h2 className="text-xl font-bold text-[#08131a] mb-3">
        エラーが発生しました
      </h2>
      <p className="text-sm text-[rgba(8,19,26,0.44)] mb-8">
        予期しないエラーが発生しました。しばらくしてから再度お試しください。
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2 text-sm font-bold text-white bg-[#41b883] rounded-lg hover:bg-[#3aa876] transition-colors"
        >
          再試行
        </button>
        <Link
          href="/"
          className="px-5 py-2 text-sm font-bold text-[rgba(8,19,26,0.66)] border border-[rgba(8,19,26,0.14)] rounded-lg hover:text-[#08131a] hover:border-[rgba(8,19,26,0.3)] transition-colors"
        >
          ノート一覧に戻る
        </Link>
      </div>
    </div>
  );
}
