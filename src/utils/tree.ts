/**
 * 树形数据处理工具函数
 */

/**
 * 将扁平数组转换为树形结构
 * @param data 扁平数组
 * @param id ID字段名，默认为 'id'
 * @param parentId 父ID字段名，默认为 'parentId'
 * @param children 子节点字段名，默认为 'children'
 * @returns 树形结构数组
 */
export function handleTree<T extends Record<string, any>>(
  data: T[],
  id: string = 'id',
  parentId: string = 'parentId',
  children: string = 'children'
): T[] {
  // 如果数据为空，直接返回空数组
  if (!data || data.length === 0) {
    return []
  }

  // 创建一个 Map 存储所有节点，key 为节点的 id
  const nodeMap = new Map<any, T>()
  
  // 存储根节点
  const rootNodes: T[] = []

  // 第一次遍历：将所有节点添加到 Map 中，并初始化 children 数组
  data.forEach(item => {
    const nodeId = item[id]
    // 创建节点的副本，避免修改原始数据
    const node = { ...item } as any
    // 初始化 children 数组
    node[children] = []
    nodeMap.set(nodeId, node)
  })

  // 第二次遍历：建立父子关系
  data.forEach(item => {
    const nodeId = item[id]
    const nodeParentId = item[parentId]
    const node = nodeMap.get(nodeId)

    if (!node) return

    // 如果 parentId 为 0、null 或 undefined，则为根节点
    if (nodeParentId === 0 || nodeParentId === null || nodeParentId === undefined) {
      rootNodes.push(node)
    } else {
      // 查找父节点
      const parentNode = nodeMap.get(nodeParentId)
      if (parentNode) {
        // 将当前节点添加到父节点的 children 数组中
        const parentChildren = parentNode[children] as T[]
        if (!parentChildren || parentChildren.length === 0) {
          (parentNode as any)[children] = []
        }
        (parentNode as any)[children].push(node)
      } else {
        // 如果找不到父节点，将其作为根节点
        rootNodes.push(node)
      }
    }
  })

  // 清理空的 children 数组
  const cleanEmptyChildren = (nodes: T[]) => {
    nodes.forEach(node => {
      const nodeChildren = node[children] as T[]
      if (nodeChildren && nodeChildren.length === 0) {
        delete (node as any)[children]
      } else if (nodeChildren && nodeChildren.length > 0) {
        cleanEmptyChildren(nodeChildren)
      }
    })
  }

  cleanEmptyChildren(rootNodes)

  return rootNodes
}


/**
 * 根据菜单类型过滤菜单树
 * @param tree 菜单树
 * @param excludeTypes 要排除的菜单类型数组
 * @returns 过滤后的菜单树
 */
export function filterMenuTree<T extends Record<string, any>>(
  tree: T[],
  excludeTypes: Array<'M' | 'C' | 'F'>,
  menuTypeField: string = 'menuType',
  childrenField: string = 'children'
): T[] {
  if (!tree || tree.length === 0) {
    return []
  }

  const result: T[] = []

  tree.forEach(node => {
    // 检查当前节点的菜单类型是否在排除列表中
    const menuType = node[menuTypeField]
    if (excludeTypes.includes(menuType)) {
      return // 跳过此节点
    }

    // 创建节点副本
    const newNode = { ...node } as any

    // 如果有子节点，递归过滤
    const children = node[childrenField] as T[]
    if (children && children.length > 0) {
      const filteredChildren = filterMenuTree(
        children,
        excludeTypes,
        menuTypeField,
        childrenField
      )
      if (filteredChildren.length > 0) {
        newNode[childrenField] = filteredChildren
      } else {
        delete newNode[childrenField]
      }
    }

    result.push(newNode)
  })

  return result
}


/**
 * 对菜单列表进行排序
 * @param menus 菜单列表
 * @param orderNumField 排序字段名，默认为 'orderNum'
 * @param createTimeField 创建时间字段名，默认为 'createTime'
 * @returns 排序后的菜单列表
 */
export function sortMenus<T extends Record<string, any>>(
  menus: T[],
  orderNumField: string = 'orderNum',
  createTimeField: string = 'createTime'
): T[] {
  if (!menus || menus.length === 0) {
    return []
  }

  // 创建副本以避免修改原数组
  const sortedMenus = [...menus]

  sortedMenus.sort((a, b) => {
    const orderNumA = a[orderNumField] ?? 0
    const orderNumB = b[orderNumField] ?? 0

    // 首先按 orderNum 排序
    if (orderNumA !== orderNumB) {
      return orderNumA - orderNumB
    }

    // 如果 orderNum 相同，按创建时间排序
    const createTimeA = a[createTimeField]
    const createTimeB = b[createTimeField]

    if (createTimeA && createTimeB) {
      return new Date(createTimeA).getTime() - new Date(createTimeB).getTime()
    }

    // 如果没有创建时间，保持原顺序
    return 0
  })

  return sortedMenus
}

/**
 * 过滤部门树（排除指定部门及其子部门）
 * @param tree 部门树
 * @param excludeDeptId 要排除的部门ID
 * @param idField ID字段名，默认为 'deptId'
 * @param childrenField 子节点字段名，默认为 'children'
 * @returns 过滤后的部门树
 */
export function filterDeptTree<T extends Record<string, any>>(
  tree: T[],
  excludeDeptId: number,
  idField: string = 'deptId',
  childrenField: string = 'children'
): T[] {
  if (!tree || tree.length === 0) {
    return []
  }

  const result: T[] = []

  tree.forEach(node => {
    // 如果当前节点是要排除的部门，跳过
    if (node[idField] === excludeDeptId) {
      return
    }

    // 创建节点副本
    const newNode = { ...node } as any

    // 如果有子节点，递归过滤
    const children = node[childrenField] as T[]
    if (children && children.length > 0) {
      const filteredChildren = filterDeptTree(
        children,
        excludeDeptId,
        idField,
        childrenField
      )
      if (filteredChildren.length > 0) {
        newNode[childrenField] = filteredChildren
      } else {
        delete newNode[childrenField]
      }
    }

    result.push(newNode)
  })

  return result
}


/**
 * 在部门树中搜索
 * @param tree 部门树
 * @param keyword 搜索关键词
 * @param nameField 名称字段名，默认为 'deptName'
 * @param childrenField 子节点字段名，默认为 'children'
 * @returns 匹配的部门列表（包含父级路径）
 */
export function searchDeptTree<T extends Record<string, any>>(
  tree: T[],
  keyword: string,
  nameField: string = 'deptName',
  childrenField: string = 'children'
): T[] {
  if (!tree || tree.length === 0) {
    return []
  }

  // 如果没有关键词，返回原树
  if (!keyword || keyword.trim() === '') {
    return tree
  }

  const result: T[] = []

  /**
   * 递归搜索函数
   * @param nodes 节点数组
   * @param parentMatched 父节点是否匹配
   * @returns 匹配的节点数组
   */
  const search = (nodes: T[], parentMatched: boolean = false): T[] => {
    const matched: T[] = []

    nodes.forEach(node => {
      const nodeName = node[nameField] as string
      const isMatch = nodeName && nodeName.includes(keyword)
      
      // 递归搜索子节点
      const children = node[childrenField] as T[]
      const childrenMatched = children && children.length > 0 
        ? search(children, isMatch || parentMatched) 
        : []

      // 如果当前节点匹配、子节点有匹配、或父节点匹配，则保留此节点
      if (isMatch || childrenMatched.length > 0 || parentMatched) {
        const newNode = { ...node } as any
        
        // 如果有匹配的子节点，设置 children
        if (childrenMatched.length > 0) {
          newNode[childrenField] = childrenMatched
        } else {
          // 如果没有匹配的子节点，删除 children 属性
          delete newNode[childrenField]
        }
        
        matched.push(newNode)
      }
    })

    return matched
  }

  return search(tree)
}
