import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Address {
    id: string;
    title: string;
    fullName: string;
    phone: string;
    country: string;
    city: string;
    district: string;
    address: string;
    zipCode: string;
    isPrimary: boolean;
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, fullName, phone, country, city, district, address, zipCode, isPrimary } = body;
        const addressId = params.id;

        const user = await prisma.userRow.findFirst({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const addresses = (user.addresses as unknown as Address[]) || [];
        const idx = addresses.findIndex((a) => a.id === addressId);
        if (idx === -1) return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });

        if (isPrimary) addresses.forEach((a) => (a.isPrimary = false));

        const addr = addresses[idx];
        if (title) addr.title = title;
        if (fullName) addr.fullName = fullName;
        if (phone) addr.phone = phone;
        if (country) addr.country = country;
        if (city) addr.city = city;
        if (district) addr.district = district;
        if (address) addr.address = address;
        if (zipCode) addr.zipCode = zipCode;
        if (isPrimary !== undefined) addr.isPrimary = isPrimary;

        await prisma.userRow.update({ where: { id: user.id }, data: { addresses: addresses as any } });

        return NextResponse.json({ success: true, message: 'Adres güncellendi.' });
    } catch (error) {
        console.error('Update Address Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addressId = params.id;
        const user = await prisma.userRow.findFirst({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const addresses = (user.addresses as unknown as Address[]) || [];
        const filtered = addresses.filter((a) => a.id !== addressId);

        if (filtered.length === addresses.length) {
            return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });
        }

        await prisma.userRow.update({ where: { id: user.id }, data: { addresses: filtered as any } });

        return NextResponse.json({ success: true, message: 'Adres silindi.' });
    } catch (error) {
        console.error('Delete Address Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
