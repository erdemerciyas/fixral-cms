export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import Portfolio from '../../../../models/Portfolio';
import Service from '../../../../models/Service';
import Message from '../../../../models/Message';
import User from '../../../../models/User';
import News from '../../../../models/News';
import Category from '../../../../models/Category';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

export const GET = withSecurity(SecurityConfigs.admin)(async () => {
  try {
    await connectDB();

    // Medya sayılarını Cloudinary'den al
    let mediaCount = 0;

    try {
      const cloudinary = await import('cloudinary').then(m => m.v2);

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const allResult = await cloudinary.api.resources({
        type: 'upload',
        prefix: `${process.env.CLOUDINARY_FOLDER || 'personal-blog'}/`,
        max_results: 500
      });

      if (allResult.resources) {
        mediaCount = allResult.resources.length;
      }

    } catch (cloudinaryError) {
      console.error('Cloudinary media count error:', cloudinaryError);
      mediaCount = 0;
    }

    const [
      portfolioCount, servicesCount, messagesCount, usersCount,
      recentMessages, newsCount, categoriesCount,
      recentNews, recentPortfolio, recentServices, recentUsers,
      unreadMessagesCount
    ] = await Promise.all([
      Portfolio.countDocuments(),
      Service.countDocuments(),
      Message.countDocuments({ type: 'contact' }),
      User.countDocuments(),
      Message.find({ type: 'contact' }).sort({ createdAt: -1 }).limit(5).select('name email subject createdAt status'),
      News.countDocuments(),
      Category.countDocuments(),
      News.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt views slug'),
      Portfolio.find().sort({ createdAt: -1 }).limit(5).select('title isActive createdAt slug'),
      Service.find().sort({ createdAt: -1 }).limit(5).select('title isActive createdAt slug'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt isActive'),
      Message.countDocuments({ type: 'contact', status: { $in: ['unread', 'new'] } }),
    ]);

    const stats = {
      portfolioCount,
      servicesCount,
      messagesCount,
      usersCount,
      mediaCount,
      newsCount,
      categoriesCount,
      unreadMessagesCount,

      recentMessages: recentMessages.map(msg => ({
        _id: msg._id,
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        createdAt: msg.createdAt,
        type: 'message',
        status: msg.status || 'unread'
      })),
      recentUsers: recentUsers.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        type: 'user'
      })),
      recentContent: [
        ...recentNews.map(item => ({ ...item.toObject(), type: 'news', title: item.title, status: item.status || (item.isActive ? 'published' : 'draft') })),
        ...recentPortfolio.map(item => ({ ...item.toObject(), type: 'portfolio', title: item.title, status: item.isActive ? 'published' : 'draft' })),
        ...recentServices.map(item => ({ ...item.toObject(), type: 'service', title: item.title, status: item.isActive ? 'published' : 'draft' })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'İstatistikler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
});
