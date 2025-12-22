import { createFileRoute } from '@tanstack/react-router'
import TaskDetail from '../pages/TaskDetail'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetail,
})