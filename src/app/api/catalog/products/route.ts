import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: true,
      },
      orderBy: { name: 'asc' },
    });

    const catalog = products.map((p) => ({
      id: p.id,
      name: p.name,
      product_type: p.productType,
      cost_price: Number(p.costPrice),
      sales_price: Number(p.salesPrice),
      notes: p.notes,
      variants: p.variants.map((v) => ({
        id: v.id,
        product_id: v.productId,
        variant_name: `${v.attributeName}: ${v.attributeValue}`,
        attribute_name: v.attributeName,
        attribute_value: v.attributeValue,
        price_extra: Number(v.priceAdjustment),
        effective_price: Number(p.salesPrice) + Number(v.priceAdjustment),
        sku: v.sku,
      })),
    }));

    return NextResponse.json({ products: catalog });
  } catch (error: any) {
    console.error('Failed to fetch product catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product catalog: ' + error.message },
      { status: 500 }
    );
  }
}
