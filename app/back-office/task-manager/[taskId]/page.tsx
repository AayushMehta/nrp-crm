'use client';

import { use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TaskDetailPage } from '@/components/task-manager/TaskDetailPage';

export default function BOTaskDetailRoute({ params }: { params: Promise<{ taskId: string }> }) {
    const { taskId } = use(params);
    const { user } = useAuth();
    return (
        <TaskDetailPage
            taskId={taskId}
            backHref="/back-office/task-manager"
            currentUserId={user?.id || ''}
            currentUserName={user?.name || ''}
        />
    );
}
