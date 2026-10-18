import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM_BASE =
  process.env.NEXT_PUBLIC_GOLD_PRICE_API_BASE_URL ||
  'https://logam-mulia-api.iamutaki.workers.dev';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${UPSTREAM_BASE}/api/${targetPath}${search}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // 5 min cache
    });

    const data = await upstreamRes.json();
    return NextResponse.json(data, {
      status: upstreamRes.status,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error proxying gold price API:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghubungi penyedia data harga emas' },
      { status: 502 }
    );
  }
}
