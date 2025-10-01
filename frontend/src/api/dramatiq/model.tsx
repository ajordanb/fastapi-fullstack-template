import { type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";

export interface DramatiqApi {
    // Query hooks
    useBrokerInfoQuery: () => UseQueryResult<BrokerInfo, Error>;
    useAllQueuesQuery: () => UseQueryResult<string[], Error>;
    useQueueStatsQuery: (queueName: string, enabled?: boolean) => UseQueryResult<QueueStats, Error>;
    useQueueJobsQuery: (queueName: string, limit?: number, enabled?: boolean) => UseQueryResult<Job[], Error>;
    useAllJobsQuery: (queueName?: string, limit?: number) => UseQueryResult<Job[], Error>;
    useJobByIdQuery: (messageId: string, enabled?: boolean) => UseQueryResult<Job, Error>;
    useDashboardQuery: () => UseQueryResult<DashboardData, Error>;
    useHealthQuery: () => UseQueryResult<HealthStatus, Error>;

    // Mutations
    cancelJob: UseMutationResult<Message, Error, string>;
    retryJob: UseMutationResult<Message, Error, string>;
    clearQueue: UseMutationResult<Message, Error, string>;
}

export interface BrokerInfo {
    [key: string]: any;
}

export interface QueueStats {
    queue_name: string;
    total_jobs: number;
    pending_jobs: number;
    completed_jobs: number;
    failed_jobs: number;
    running_jobs: number;
}

export interface Job {
    message_id: string;
    queue_name: string;
    actor_name: string;
    args: any[];
    kwargs: any;
    options: any;
    status?: string;
    created_at?: string;
    [key: string]: any;
}

export interface DashboardData {
    broker_info: BrokerInfo;
    total_stats: {
        total_jobs: number;
        pending_jobs: number;
        completed_jobs: number;
        failed_jobs: number;
        running_jobs: number;
    };
    queue_stats: QueueStats[];
    queues: string[];
}

export interface HealthStatus {
    status: string;
    service: string;
}

export interface Message {
    message: string;
    type?: string;
}