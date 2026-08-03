'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import SliderForm from '../../SliderForm';
import { FormPageSkeleton } from '@/components/admin/admin-skeletons';

export default function EditSliderPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [slider, setSlider] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlider = async () => {
            try {
                const response = await fetch(`/api/admin/slider/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setSlider(data);
                } else {
                    toast.error('Slider bulunamadı');
                    router.push('/admin/slider');
                }
            } catch (error) {
                console.error('Error fetching slider:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlider();
    }, [params.id, router]);

    if (loading) {
        return <FormPageSkeleton />;
    }

    if (!slider) return null;

    return <SliderForm initialData={slider} isEditing={true} />;
}
