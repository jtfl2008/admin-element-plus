import { ElLoading } from 'element-plus';
let useTable = ({
  getTableData,
  inQuery,
  inReset,
  immediate = true,
  downloadFile,
}) => {
  let queryFormRef = ref(null);
  let queryForm = ref(null);
  let pageNum = ref(1);
  let pageSize = ref(10);
  let data = ref([]);
  let total = ref(0);
  let loadingInstance = ref(null);

  let loadingStart = () => {
    loadingInstance = ElLoading.service({
      target: document.querySelector('.pro-table'),
      fullscreen: true,
    });
  };
  let loadingClose = () => {
    nextTick(() => {
      loadingInstance.value?.close();
    });
  };
  let getDataList = async () => {
    // loadingStart();
    let params = {
      pageNum: pageNum.value, 
      pageSize: pageSize.value,
    };
    try {
      let { dataList, totalCount } = await getTableData(params);
      data.value = dataList;
      total.value = totalCount;
    } finally {
      loadingClose();
    }
  };

  function onCurrentChange(val) {
    pageNum.value = val; 
    getDataList();
  }

  function onSizeChange(val) {
    pageNum.value = 1; 
    pageSize.value = val;
    getDataList();
  }
  let refresh = async () => {
    pageNum.value = 1; 
    pageSize.value = 10;
    await getDataList();
  };
  let onQuery = async () => {
    if (inQuery) {
      await inQuery();
    }
    pageNum.value = 1; 
    refresh();
  };
  let onReset = async () => {
    if (inReset) {
      await inReset();
    } else {
      // 清空查询表单
      await queryFormRef.value.resetFields();
      // 重置 queryForm 为 null，清除所有查询条件
      queryForm.value = null;
      // 刷新数据
      refresh();
    }
  };
  onMounted(async () => {
    if (!immediate) return;
    await getDataList();
  });
  let onDownloadFile = async (name) => {
    let res = await downloadFile();
    // console.log(res)
    let blob = new Blob([res.data], {
      type: 'application/vnd.ms-excel',
    });
    let filename =
      name || decodeURI(res.headers['content-disposition'].split('=')[1]);
    if ('download' in document.createElement('a')) {
      let elink = document.createElement('a');
      elink.download = filename;
      elink.style.display = 'none';
      elink.href = URL.createObjectURL(blob);
      document.body.appendChild(elink);
      elink.click();
      URL.revokeObjectURL(elink.href);
      document.body.removeChild(elink);
    } else {
      navigator.msSaveBlob(blob, filename);
    }
  };
  return {
    queryFormRef,
    queryForm,
    data,
    total,
    onQuery,
    onReset,
    refresh,
    pageNum, 
    pageSize,
    onCurrentChange,
    onSizeChange,
    onDownloadFile,
  };
};
export default useTable;
