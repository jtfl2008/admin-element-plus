import type { Ref } from 'vue'

export interface UseTableOptions {
  getTableData: (params: any) => Promise<{ dataList: any[]; totalCount: number }>
  inQuery?: () => void | Promise<void>
  inReset?: () => void | Promise<void>
  immediate?: boolean
  downloadFile?: () => Promise<any>
}

export interface UseTableReturn {
  queryFormRef: Ref<any>
  queryForm: Ref<Record<string, any>>
  data: Ref<any[]>
  total: Ref<number>
  onQuery: () => Promise<void>
  onReset: () => Promise<void>
  refresh: () => Promise<void>
  pageNum: Ref<number>
  pageSize: Ref<number>
  onCurrentChange: (val: number) => void
  onSizeChange: (val: number) => void
  onDownloadFile: (name?: string) => Promise<void>
}

declare function useTable(options: UseTableOptions): UseTableReturn

export default useTable
