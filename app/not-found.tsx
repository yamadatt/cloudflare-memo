import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-5xl font-bold text-[rgba(8,19,26,0.14)] mb-6">404</p>
      <h2 className="text-xl font-bold text-[#08131a] mb-3">
        ノートが見つかりませんでした
      </h2>
      <p className="text-sm text-[rgba(8,19,26,0.44)] mb-8">
        お探しのノートは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2 text-sm font-bold text-white bg-[#41b883] rounded-lg hover:bg-[#3aa876] transition-colors"
      >
        ノート一覧に戻る
      </Link>
    </div>
  );
}
