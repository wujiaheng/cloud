<template>
  <div class="app-container">
    <div class="filter-container">

      <!--查询条件-->
      <el-input v-model="listQuery.name" style="width: 200px;" class="filter-item" placeholder="权限名称" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.code" style="width: 200px;" class="filter-item" placeholder="权限码" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.type" class="filter-item" placeholder="请选择系统类型" filterable clearable>
        <el-option v-for="item in systemType" :key="item" :label="item.dictValue" :value="item.dictValue" />
      </el-select>
      <el-select v-model="listQuery.method" class="filter-item" placeholder="请选择请求方式" filterable clearable>
         <el-option v-for="item in methodList" :key="item" :label="item.dictValue" :value="item.dictValue" />
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
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-delete" :loading="downloadLoading" @click="handleDelete">
        删除
      </el-button>
    </div>

    <!--列表-->
    <el-table ref="multipleTable" v-loading.body="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column type="selection" />
      <!-- <el-table-column type="index" width="50" align="center" label="序号"/> -->
      <!-- <el-table-column  align="center" label="ID">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column> -->
      <el-table-column align="center" label="权限名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="权限码">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="系统类型">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="接口地址">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="请求方式">
        <template slot-scope="scope">
          <span>{{ scope.row.method }}</span>
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

      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row.id)">
            修改
          </el-button>
          <el-button type="danger" size="mini" @click="deleteData(scope.row.id)">
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
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限码" prop="code">
          <el-input v-model="temp.code" placeholder="请输入权限码" />
        </el-form-item>
        <el-form-item label="系统类型" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="请选择系统类型" filterable >
            <el-option v-for="item in systemType" :key="item" :label="item.dictValue" :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口地址" prop="url">
          <!--:disabled="dialogStatus=='edit'"-->
          <el-input v-model="temp.url" placeholder="请输入接口地址" />
        </el-form-item>
        <!-- <el-form-item label="角色" prop="roles">
          <el-select v-model="temp.roleIds" multiple clearable style="width: 100%;" placeholder="请选择" @visible-change="getRoles">
            <el-option v-for="item in roleList" :key="item.code" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="请求方式" prop="method">
          <el-select v-model="temp.method" class="filter-item" placeholder="请选择请求方式" filterable >
            <el-option v-for="item in methodList" :key="item" :label="item.dictValue" :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="temp.description" :rows="5" type="textarea" placeholder="请输入权限简介" />
        </el-form-item>
      </el-form>
      <!--对话框动作按钮-->
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button>
        <el-button v-if="dialogStatus=='edit'" type="primary" @click="updateData">修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {
  queryResource,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  batchDeleteResource
} from '@/api/organization/resource'
import {
  queryDictDataWithCode
} from '@/api/queryDictAndData'
import {
  getAllRoles
} from '@/api/organization/role'

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
      list: null,
      total: 0,
      listLoading: true,
      downloadLoading: false,
      // 查询参数
      listQuery: {
        status: 'ok',
        current: 1,
        size: 20
      },
      // 存放系统类型集合
      systemType: [],
      //存放请求方式集合
      methodList:[],
      dialogStatus: 'create',
      dialogFormVisible: false,
      // 表单校验规则
      rules: {
        name: [{
          required: true,
          message: '权限名必填',
          trigger: 'blur'
        },
        {
          min: 3,
          max: 20,
          message: '权限名长度在3到20个字符',
          trigger: 'blur'
        }
        ],
        code: [{
          required: true,
          message: 'code不能为空',
          trigger: 'blur'
        },
        {
          min: 3,
          max: 60,
          message: 'code长度在3到60个字符',
          trigger: 'blur'
        }
        ],
        type: [{
          required: true,
          message: 'type为必填',
          trigger: 'blur'
        }],
        url: [{
          required: true,
          message: '接口地址为必填',
          trigger: 'blur'
        }],
        method: [{
          required: true,
          message: '方法名为必填',
          trigger: 'blur'
        }]
      },
      // 创建或修改用户临时对象
      temp: {}
    }
  },
  // 页面加载完成后显示列表页
  created() {
    this.queryMethodType()
    this.querySystemType()
    this.queryResource()
    this.resetForm()
  },
  methods: {

    queryMethodType(){
      queryDictDataWithCode("method_type").then(response =>{
        this.methodList=response.data.list
      })
    },

    querySystemType(){
      queryDictDataWithCode("system_type").then(response =>{
        this.systemType=response.data.list
      })
    },
    /**
       * 权限列表
       */
    queryResource() {
      this.listLoading = true
      queryResource(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    /**
       * 角色列表
       */
    getRoles(isShow) {
      if (isShow) {
        getAllRoles().then(response => {
          this.roleList = response.data
        })
      }
    },
    // 查询过滤器
    handleFilter() {
      this.listQuery.current = 1
      this.queryResource()
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
       * 修改每页显示条数
       */
    handleSizeChange(val) {
      this.listQuery.size = val
      this.queryResource()
    },
    /**
       * 跳转到指定页
       */
    handleCurrentChange(val) {
      this.listQuery.current = val
      this.queryResource()
    },
    /**
       * 重置添加表单
       */
    resetForm() {
      this.temp = {
        code: '',
        name: '',
        type: '',
        url: '',
        description: '',
        method: ''
      }
    },
    /**
       * 弹出创建权限表单
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
       * 创建权限
       */
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createResource(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '创建成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.temp.roleIds = []
            this.queryResource()
          })
        }
      })
    },
    /**
       * 弹出修改权限表单
       */
    handleUpdate(id) {
      this.listLoading = true
      getResource(id).then(response => {
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
       * 修改权限信息
       */
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateResource(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '编辑成功',
              message: '编辑成功',
              type: 'success',
              duration: 2000
            })
            this.temp.roleIds = []
            this.queryResource()
          })
        }
      })
    },
    /**
       * 删除权限
       */
    deleteData(id) {
        this.oprenConfirm("此操作将删除该权限,是否继续?",function(){
          deleteResource(id).then(() => {
            this.oprenNotify(this.queryResource())
          })
       })

    },

    /**
     * 批量删除
     */
    handleDelete() {
      var that= this
      var selectRows = this.$refs.multipleTable.selection
      if (selectRows.length > 0) {
        this.oprenConfirm("确认要删除选中的" + selectRows.length + "条数据吗",function(){
          var list = []
          selectRows.map((item , index) => {
            list[index] = item.id
          })
          batchDeleteResource(list).then(() => {
           that.oprenNotify(that.queryResource())
          })
        })
      }

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
    oprenNotify(callBack) {
      this.$notify({
        title: '删除成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      if (callBack) {
        callBack()
      }
    }


  }
}
</script>
