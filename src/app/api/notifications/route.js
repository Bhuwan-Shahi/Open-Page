import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';
import { getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications';

export const GET = withAuth(async function(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const notifications = await getAllNotifications(request.user.id, limit);
    
    return NextResponse.json({
      notifications,
      total: notifications.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async function(request) {
  try {
    const { notificationId, action } = await request.json();

    if (action === 'mark-read' && notificationId) {
      // Mark specific notification as read
      await markNotificationAsRead(notificationId);
      return NextResponse.json({
        message: 'Notification marked as read'
      }, { status: 200 });
    } else if (action === 'mark-all-read') {
      // Mark all notifications as read for the user
      await markAllNotificationsAsRead(request.user.id);
      return NextResponse.json({
        message: 'All notifications marked as read'
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
