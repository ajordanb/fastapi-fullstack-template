import { useAuth } from "@/hooks/useAuth";
import {
    useMutation,
    useQuery,
    type UseQueryResult,
} from "@tanstack/react-query";
import type {
    DramatiqApi,
    BrokerInfo,
    QueueStats,
    Job,
    DashboardData,
    HealthStatus,
    Message
} from "./model";

export const dramatiqApi = (): DramatiqApi => {
    const { authGet, authPost, authDelete, isAuthenticated } = useAuth();
    const baseUrl = "dramatiq";

    // Query hooks
    const useBrokerInfoQuery = (): UseQueryResult<BrokerInfo, Error> =>
        useQuery({
            queryKey: ["dramatiqBrokerInfo"],
            queryFn: async () => {
                return await authGet<BrokerInfo>(`${baseUrl}/broker/info`);
            },
            enabled: isAuthenticated,
        });

    const useAllQueuesQuery = (): UseQueryResult<string[], Error> =>
        useQuery({
            queryKey: ["dramatiqQueues"],
            queryFn: async () => {
                return await authGet<string[]>(`${baseUrl}/queues`);
            },
            enabled: isAuthenticated,
        });

    const useQueueStatsQuery = (queueName: string, enabled: boolean = true): UseQueryResult<QueueStats, Error> =>
        useQuery({
            queryKey: ["dramatiqQueueStats", queueName],
            queryFn: async () => {
                return await authGet<QueueStats>(`${baseUrl}/queues/${queueName}/stats`);
            },
            enabled: isAuthenticated && enabled && !!queueName,
        });

    const useQueueJobsQuery = (
        queueName: string,
        limit: number = 100,
        enabled: boolean = true
    ): UseQueryResult<Job[], Error> =>
        useQuery({
            queryKey: ["dramatiqQueueJobs", queueName, limit],
            queryFn: async () => {
                return await authGet<Job[]>(`${baseUrl}/queues/${queueName}/jobs`, {
                    params: { limit }
                });
            },
            enabled: isAuthenticated && enabled && !!queueName,
        });

    const useAllJobsQuery = (
        queueName: string = "default",
        limit: number = 100
    ): UseQueryResult<Job[], Error> =>
        useQuery({
            queryKey: ["dramatiqAllJobs", queueName, limit],
            queryFn: async () => {
                return await authGet<Job[]>(`${baseUrl}/jobs/all`, {
                    params: { queue_name: queueName, limit }
                });
            },
            enabled: isAuthenticated,
        });

    const useJobByIdQuery = (messageId: string, enabled: boolean = true): UseQueryResult<Job, Error> =>
        useQuery({
            queryKey: ["dramatiqJobById", messageId],
            queryFn: async () => {
                return await authGet<Job>(`${baseUrl}/jobs/${messageId}`);
            },
            enabled: isAuthenticated && enabled && !!messageId,
        });

    const useDashboardQuery = (): UseQueryResult<DashboardData, Error> =>
        useQuery({
            queryKey: ["dramatiqDashboard"],
            queryFn: async () => {
                return await authGet<DashboardData>(`${baseUrl}/dashboard`);
            },
            enabled: isAuthenticated,
        });

    const useHealthQuery = (): UseQueryResult<HealthStatus, Error> =>
        useQuery({
            queryKey: ["dramatiqHealth"],
            queryFn: async () => {
                return await authGet<HealthStatus>(`${baseUrl}/health`);
            },
            enabled: isAuthenticated,
        });

    // Mutations
    const cancelJob = useMutation<Message, Error, string>({
        mutationFn: async (messageId) => authPost<Message>(
            `${baseUrl}/jobs/${messageId}/cancel`,
            {}
        )
    });

    const retryJob = useMutation<Message, Error, string>({
        mutationFn: async (messageId) => authPost<Message>(
            `${baseUrl}/jobs/${messageId}/retry`,
            {}
        )
    });

    const clearQueue = useMutation<Message, Error, string>({
        mutationFn: async (queueName) => authDelete<Message>(
            `${baseUrl}/queues/${queueName}/clear`
        )
    });

    return {
        useBrokerInfoQuery,
        useAllQueuesQuery,
        useQueueStatsQuery,
        useQueueJobsQuery,
        useAllJobsQuery,
        useJobByIdQuery,
        useDashboardQuery,
        useHealthQuery,
        cancelJob,
        retryJob,
        clearQueue,
    };
};