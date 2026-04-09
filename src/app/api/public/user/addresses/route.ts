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

async function getUserRow(email: string) {
    return prisma.userRow.findFirst({ where: { email } });
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getUserRow(session.user.email);
        if (!user) {
            return NextResponse.json({ success: true, data: [] });
        }

        const addresses = (user.addresses as unknown as Address[]) || [];
        const sorted = [...addresses].sort((a, b) =>
            a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
        );

        return NextResponse.json({ success: true, data: sorted });
    } catch (error) {
        console.error('Fetch Addresses Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, fullName, phone, country, city, district, address, zipCode, isPrimary } = body;

        if (!title || !address || !city) {
            return NextResponse.json({ error: 'Zorunlu alanları doldurunuz.' }, { status: 400 });
        }

        let user = await getUserRow(session.user.email);
        if (!user) {
            // Auto-create UserRow for users who authenticated via MongoDB
            user = await prisma.userRow.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || '',
                    password: '',
                    role: (session.user as any).role || 'user',
                    addresses: [],
                },
            });
        }

        const addresses = (user.addresses as unknown as Address[]) || [];

        const newAddress: Address = {
            id: crypto.randomUUID(),
            title,
            fullName,
            phone: phone || '',
            country: country || 'Türkiye',
            city,
            district: district || '',
            address,
            zipCode: zipCode || '',
            isPrimary: isPrimary || addresses.length === 0,
        };

        if (newAddress.isPrimary) {
            addresses.forEach((a) => (a.isPrimary = false));
        }

        addresses.push(newAddress);

        const updated = await prisma.userRow.update({
            where: { id: user.id },
            data: { addresses: addresses as any },
        });

        return NextResponse.json({
            success: true,
            data: updated.addresses as unknown as Address[],
            message: 'Adres eklendi.',
        });
    } catch (error) {
        console.error('Add Address Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
