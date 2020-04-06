<template>
  <div class="app-container">
    <div class="filter-container">

      <!--查询条件-->
      <el-input v-model="listQuery.name" style="width: 200px;" class="filter-item" placeholder="字典名称" @keyup.enter.native="handleFilter" clearable/>
      <el-input v-model="listQuery.code" style="width: 200px;" class="filter-item" placeholder="字典值" @keyup.enter.native="handleFilter" clearable/>
      <el-select v-model="listQuery.status" clearable class="filter-item" placeholder="字典状态" clearable>
        <el-option v-for="item in enableStatus" :key="item" :label="item.dictLabel" :value="item.dictValue" />
      </el-select>

      <!--动作按钮-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="handlerefresh">
        重置
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <!--列表-->
    <el-table ref="multipleTable" v-loading.body="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column type="selection" />

      <el-table-column align="center" label="字典名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="字典key">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="160">
         <template slot-scope="scope">
          <el-switch
            :value="scope.row.status == 1"
            active-text="启用"
            inactive-text="禁用"
            >
          </el-switch>
         </template>
      </el-table-column>
      <el-table-column align="center" label="排序">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="简介">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column width="160px" align="center" label="修改时间">
        <template slot-scope="scope">
          <span>{{ scope.row.updatedTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="修改人">
        <template slot-scope="scope">
          <span>{{ scope.row.updatedBy }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="可编辑">
        <template slot-scope="scope">
          <span>{{ scope.row.enableEdit }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleQueryValue(scope.row.code,scope.row.enableEdit)">
            查看数据
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row.id)" v-if="scope.row.enableEdit=='Y'">
            修改
          </el-button>
          <el-button type="danger" size="mini" @click="deleteData(scope.row.id)" v-if="scope.row.enableEdit=='Y'">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--翻页工具条-->
    <div class="pagination-container">
      <el-pagination
        background
        :current-page="listQuery.current"
        :page-sizes="[20, 30, 50,100]"
        :page-size="listQuery.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!--添加或编辑对话框-->
    <el-dialog title="新增/修改" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="120px" status-icon style="width: 80%; margin-left:60px;">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="code">
          <el-input v-model="temp.code" placeholder="请输入字典码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status"  class="filter-item" placeholder="请选择字典状态" >
            <el-option v-for="item in enableStatus" :key="item" :label="item.dictLabel" :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="字典说明" prop="description">
          <!--:disabled="dialogStatus=='edit'"-->
          <el-input v-model="temp.description" placeholder="请输入接口地址" />
        </el-form-item>
        <el-form-item label="字典排序" prop="sort">
          <!--:disabled="dialogStatus=='edit'"-->
          <el-input v-model="temp.sort" placeholder="请输入排序,数字越小越靠前" />
        </el-form-item>

      </el-form>
      <!--对话框动作按钮-->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button>
        <el-button v-if="dialogStatus=='edit'" type="primary" @click="updateData">修改</el-button>
      </div>
    </el-dialog>



    <!--字典数据表格-->
    <el-dialog title="字典数据" :visible.sync="tableDialogFormVisible" width="80%">
      <div class="filter-container">

        <!--查询条件-->
        <el-input v-model="dictDataListQuery.dictLabel" style="width: 200px;" class="filter-item" placeholder="字典名称" @keyup.enter.native="handleDictDataFilter" clearable/>
        <el-input v-model="dictDataListQuery.dictValue" style="width: 200px;" class="filter-item" placeholder="值" @keyup.enter.native="handleDictDataFilter" clearable/>
        <el-select v-model="dictDataListQuery.status" clearable class="filter-item" placeholder="数据状态" clearable>
          <el-option v-for="item in enableStatus" :key="item" :label="item.dictLabel" :value="item.dictValue" />
        </el-select>

        <!--动作按钮-->
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="handleDictDatarefresh">
          重置
        </el-button>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleDictDataFilter">
          搜索
        </el-button>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-edit" @click="dictDataHandleCreate" v-if="enableEdit=='Y'">
          新增
        </el-button>
      </div>
      <el-table ref="dictDataTable" v-loading.body="listLoading" :data="dictDataList" border fit highlight-current-row style="width: 100%">

        <el-table-column align="center" label="数据含义">
          <template slot-scope="scope">
            <span>{{ scope.row.dictLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="数据值">
          <template slot-scope="scope">
            <span>{{ scope.row.dictValue }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" width="400">
           <template slot-scope="scope">
            <el-switch
              :value="scope.row.status == 1"
              active-text="启用"
              inactive-text="禁用"
              >
            </el-switch>
           </template>
          <!-- <template slot-scope="scope">
            <span>{{ scope.row.status }}</span>
          </template> -->
        </el-table-column>
        <el-table-column align="center" label="排序">
          <template slot-scope="scope">
            <span>{{ scope.row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注">
          <template slot-scope="scope">
            <span>{{ scope.row.description }}</span>
          </template>
        </el-table-column>

        <el-table-column width="160px" align="center" label="修改时间">
          <template slot-scope="scope">
            <span>{{ scope.row.updatedTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="修改人">
          <template slot-scope="scope">
            <span>{{ scope.row.updatedBy }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="400" v-if="enableEdit=='Y'">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="dictDataHandleUpdate(scope.row.id)">
              修改
            </el-button>
            <el-button type="danger" size="mini" @click="deleteDictData(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--数据的翻页工具条-->
      <div class="pagination-container">
        <el-pagination
          background
          :current-page="dictDataListQuery.current"
          :page-sizes="[20, 30, 50,100]"
          :page-size="dictDataListQuery.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dictDataTotal"
          @size-change="dictDataHandleSizeChange"
          @current-change="dictDataHandleCurrentChange"
        />
      </div>
       <el-dialog width="50%" title="新增/修改"
             :visible.sync="dictDatatableDialogFormVisible"
             append-to-body>
             <el-form ref="dictDataForm" :rules="rules" :model="tempDictData" label-position="right" label-width="120px" >
               <el-form-item label="数据含义" prop="dictLabel">
                 <el-input v-model="tempDictData.dictLabel" placeholder="请输入数据含义" />
               </el-form-item>
               <el-form-item label="数据值" prop="dictValue">
                 <el-input v-model="tempDictData.dictValue" placeholder="请输入数据值" />
               </el-form-item>
               <el-form-item label="状态" prop="status">
                 <el-select v-model="tempDictData.status" clearable class="filter-item" placeholder="请选择字典状态" clearable>
                   <el-option v-for="item in enableStatus" :key="item" :label="item.dictLabel" :value="item.dictValue" />
                 </el-select>
               </el-form-item>


               <el-form-item label="备注" prop="description">
                 <!--:disabled="dialogStatus=='edit'"-->
                 <el-input v-model="tempDictData.description" placeholder="请输入备注" />
               </el-form-item>
               <el-form-item label="排序" prop="sort">
                 <!--:disabled="dialogStatus=='edit'"-->
                 <el-input v-model="tempDictData.sort" placeholder="请输入排序,数字越小越靠前" />
               </el-form-item>
             </el-form>
             <!--对话框动作按钮-->
             <div slot="footer" class="dialog-footer">
               <el-button @click="dictDatatableDialogFormVisible = false">取消</el-button>
               <el-button v-if="dialogStatus=='create'" type="primary" @click="createDictData">创建</el-button>
               <el-button v-if="dialogStatus=='edit'" type="primary" @click="updateDictData">修改</el-button>
             </div>
           </el-dialog>

    </el-dialog>

  </div>
</template>

<script>

import {
  queryDict,
  queryDictData,
  createDict,
  createDictData,
  getDict,
  getDictData,
  updateDict,
  updateDictData,
  deleteDict,
  deleteDictData
} from '@/api/organization/dict'
import {
  queryEnableStatus
} from '@/api/queryDictAndData'
import waves from '@/directive/waves'

export default {
  name: 'ResourceManagement',
  // 水波文效果
  directives: {
    waves
  },
  filters: {
    // 用户状态标签样式
    statusFilter(status) {
      const statusMap = {
        lock: 'danger',
        deleted: 'info',
        ok: 'success'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null, //字典表
      dictDataList:null, //字典数据表
      total: 0,
      dictDataTotal:0, //字典数据表总数
      listLoading: true,
      downloadLoading: false,
      // 字典查询参数
      listQuery: {
        current: 1,
        size: 20
      },
      //字典数据查询参数
      dictDataListQuery: {
        current: 1,
        size: 20
      },
      // 数据状态
      enableStatus: [],
      enableEdit: "Y",
      dictCode:'',//控制当前打开的dictData是属于哪一个字典
      dialogStatus: 'create',
      dialogFormVisible: false,
      tableDialogFormVisible: false,//控制dictData弹窗表格
      dictDatatableDialogFormVisible: false,//控制dictData表单弹窗表格
      // 表单校验规则
      rules: {
        username: [{
          required: true,
          message: '用户名必填',
          trigger: 'blur'
        },
        {
          min: 3,
          max: 20,
          message: '用户名长度在3到20个字符',
          trigger: 'blur'
        }
        ],
        mobile: [{
          required: true,
          message: '用户手机号不能为空',
          trigger: 'blur'
        }],
        password: [{
          required: true,
          message: '用户密码为必填',
          trigger: 'blur'
        },
        {
          min: 5,
          max: 20,
          message: '用户密码长度在5到20个字符',
          trigger: 'blur'
        }
        ]
      },
      // 创建或修改字典临时对象
      temp: {

      },
      tempDictData:{

      },
    }
  },
  // 页面加载完成后显示列表页
  created() {
    //获取状态
    this.queryEnableStatus()
    //查询列表
    this.queryDict()
    //重置表单
    this.resetForm()
  },
  methods: {
      /**
       * 查询启用禁用状态
       */
      queryEnableStatus(){
        queryEnableStatus().then(response => {
          this.enableStatus=response.data.list
        })
      },
       /**
       * 字典列表
       */
    queryDict() {
      this.listLoading = true
      queryDict(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    /**
     * 打开某一个字典下的数据表
     * @param {Object} dictCode
     */
    handleQueryValue(dictCode,enableEdit) {
      this.tableDialogFormVisible=true
      this.dictCode=dictCode
      this.dictDataListQuery.dictCode=dictCode
      this.tempDictData=dictCode
      this.enableEdit=enableEdit
      this.queryDictData(dictCode)
    },
    /**
       * 字典数据列表
       */
    queryDictData(code) {
       this.dictDataList =null
      this.listLoading = true
      if (code) {
        this.dictDataListQuery.dictCode=code
      }
      queryDictData(this.dictDataListQuery).then(response => {
        this.dictDataList = response.data.records
        this.dictDataTotal = response.data.total
        this.listLoading = false
      })
    },

    // 查询过滤器
    handleFilter() {
      this.listQuery.current = 1
      this.queryDict()
    },
    // 查询DictData过滤器
    handleDictDataFilter() {
      this.dictDataListQuery.current = 1
      this.queryDictData()
    },
    /**
     * 重置查询条件
     */
    handlerefresh() {
      this.listQuery = {
        current: 1,
        size: 10
      }
    },
    /**
     * 重置DictData查询条件
     */
    handleDictDatarefresh() {
      var dictData = this.dictDataListQuery.dictData
      this.dictDataListQuery = {
        current: 1,
        size: 10,
        dictData: dictData
      }
    },
    /**
       * 修改每页显示条数
       */
    handleSizeChange(val) {
      this.listQuery.size = val
      this.queryDict()
    },
    /**
       * 修改字典数据每页显示条数
       */
    dictDataHandleSizeChange(val) {
      this.dictDataListQuery.size = val
      this.queryDictData()
    },
    /**
       * 跳转到指定页
       */
    handleCurrentChange(val) {
      this.listQuery.current = val
      this.queryDict()
    },
    /**
       * dictData跳转到指定页
       */
    dictDataHandleCurrentChange(val) {
      this.dictDataListQuery.current = val
      this.queryDictData()
    },

    /**
       * 重置添加表单
       */
    resetForm() {
      this.temp = {
        code: '',
        name: '',
        status: '',
        sort: '',
        description: ''
      }
    },
    /**
       * 重置DictData添加表单
       */
    resetDictDataForm() {
      this.tempDictData = {
        dictLabel: '',
        dictValue: '',
        dictCode: this.dictCode,
        sort: '',
        description: ''
      }

    },


    /**
       * 弹出创建字典表单
       */
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.resetForm()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    /**
       * 弹出创建DictData表单
       */
    dictDataHandleCreate() {
      this.dialogStatus = 'create'
      this.dictDatatableDialogFormVisible = true
      this.resetDictDataForm()
      this.$nextTick(() => {
        this.$refs['dictDataForm'].clearValidate()
      })
    },
    /**
       * 创建字典
       */
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createDict(this.temp).then((response) => {
            if(response.code =="000000"){
              this.dialogFormVisible = false
              this.successNotify("创建")
              this.queryDict()
            }
          })
        }
      })
    },
    createDictData() {
       this.$refs['dictDataForm'].validate((valid) => {
          if (valid) {
            createDictData(this.tempDictData).then((response) => {
              if(response.code =="000000"){
                this.dictDatatableDialogFormVisible = false
                this.successNotify("创建")
                this.queryDictData()
              }
            })
          }
        })
    },
    /**
       * 弹出修改字典表单
       */
    handleUpdate(id) {
      this.listLoading = true
      getDict(id).then(response => {
        this.temp = response.data
        this.listLoading = false
        this.dialogStatus = 'edit'
        this.dialogFormVisible = true
      })
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    /**
       * 弹出修改dictData表单
       */
    dictDataHandleUpdate(id) {
      this.listLoading = true
      getDictData(id).then(response => {
        this.tempDictData = response.data
        this.listLoading = false
        this.dialogStatus = 'edit'
        this.dictDatatableDialogFormVisible = true
      })
      this.$nextTick(() => {
        this.$refs['dictDataForm'].clearValidate()
      })
    },
    /**
       * 修改字典信息
       */
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateDict(this.temp).then((response) => {
            if(response.code =="000000"){
              this.dialogFormVisible = false
              this.successNotify("编辑")
              this.queryDict()
            }else {
              this.failNotify("编辑",response.data)
            }
          })
        }
      })
    },
    /**
       * 修改字典信息
       */
    updateDictData() {
      this.$refs['dictDataForm'].validate((valid) => {
        if (valid) {
          updateDictData(this.tempDictData).then((response) => {
            if(response.code =="000000"){
              this.dictDatatableDialogFormVisible = false
              this.successNotify("编辑")
              this.queryDictData()
            }
          })
        }
      })
    },
    /**
       * 删除字典
       */
    deleteData(id) {
      var that =this
        this.oprenConfirm("此操作将删除该字典,是否继续?",function(){
          deleteDict(id).then(() => {
            that.successNotify("删除",that.queryDict())
          })
       })

    },
    /**
       * 删除DictData
       */
    deleteDictData(id) {
       var that =this
        this.oprenConfirm("此操作将删除该数据,是否继续?",function(){
          deleteDictData(id).then(() => {
            that.successNotify("删除",that.queryDictData())
          })
       })

    },
    /**
     *通用的确认框
     */
    oprenConfirm(title,callBack) {
      this.$confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true,
        type: 'warning'
      }).then(() => {
        callBack()
      })
    },
    /**
     *通用的提示
     */
    successNotify(type,callBack) {
      this.oprenNotify(type +"成功",type +"成功","success",callBack)
    },
    failNotify(type,msg,callBack) {
      this.oprenNotify(type+"失败",msg,"error",callBack)
    },
    oprenNotify(title,msg,type,callBack) {
      this.$notify({
        title: title,
        message: msg,
        type: type,
        duration: 3000
      })
      if (callBack) {
        callBack()
      }
    }


  }
}
</script>
