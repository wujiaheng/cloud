<template>
  <div class="app-container">
    <div class="filter-container">

      <!--查询条件-->
      <el-input v-model="listQuery.name" style="width: 200px;" class="filter-item" placeholder="品牌名称" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.nameFirst" style="width: 200px;" class="filter-item" placeholder="品牌首字母" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" clearable class="filter-item" placeholder="启用禁用" clearable>
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
      <el-table-column align="center" label="品牌名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="品牌首字母">
        <template slot-scope="scope">
          <span>{{ scope.row.nameFirst }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="160">
        <template slot-scope="scope">
          <el-switch
            :value="scope.row.status == 1"
            active-text="启用"
            inactive-text="禁用"
          />
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
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌首字母" prop="nameFirst">
          <el-input v-model="temp.nameFirst" placeholder="请输入品牌首字母" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="temp.sort" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择字典状态">
            <el-option v-for="item in enableStatus" :key="item" :label="item.dictLabel" :value="item.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌图片" prop="image">
          <el-upload
            ref="upload"
            class="avatar-uploader"
            :disabled="formRead"
            :action="uploadUrl"
            with-credentials
            :show-file-list="false"
            :on-change="handleUploadChange"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="temp.image" :src="temp.image" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
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
  queryBrand,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  batchDeleteBrand
} from '@/api/product/productBrand'
import {
  queryDictDataWithCode,
  queryEnableStatus
} from '@/api/queryDictAndData'

import { uploadUrl } from '@/api/upload'
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
      imageUrl: '',
      // 状态集合
      enableStatus: [],
      list: null,
      total: 0,
      listLoading: true,
      downloadLoading: false,
      // 查询参数
      listQuery: {
        current: 1,
        size: 20
      },
      // 存放系统类型集合
      systemType: [],
      // 存放请求方式集合
      methodList: [],
      dialogStatus: 'create',
      dialogFormVisible: false,
      // 表单校验规则
      rules: {
        name: [{
          required: true,
          message: '品牌名称必填',
          trigger: 'blur'
        },
        {
          min: 1,
          max: 50,
          message: '品牌名长度在3到50个字符',
          trigger: 'blur'
        }
        ],
        nameFirst: [{
          required: true,
          message: '品牌首字母不能为空',
          trigger: 'blur'
        },
        {
          min: 1,
          max: 2,
          message: '品牌首字母长度为1-2个字符',
          trigger: 'blur'
        }
        ],
        sort: [{
          required: true,
          message: '排序为必填',
          trigger: 'blur'
        }],
        image: [{
          required: true,
          message: '必须上传图片',
          trigger: 'change'
        }]
      },
      // 创建或修改用户临时对象
      temp: { image: '' }
    }
  },
  // 页面加载完成后显示列表页
  created() {
    this.queryEnableStatus()
    this.queryBrand()
    this.resetForm()
    this.uploadUrl = uploadUrl()
  },
  methods: {
    handleUploadChange(file, fileList) {
      if (fileList.length > 1) {
        fileList.splice(0, 1)
      }
    },
    handleAvatarSuccess(res, file) {
      console.log(res)
      this.temp.image = res.data
      this.$forceUpdate()
    },
    beforeAvatarUpload(file) {
      const isIMG = new RegExp('image/*').test(file.type)
      const isLt2M = file.size / 1024 / 1024 < 20
      return isIMG && isLt2M
    },
    queryEnableStatus() {
      queryEnableStatus().then(response => {
        this.enableStatus = response.data.list
      })
    },

    /**
       * 品牌列表
       */
    queryBrand() {
      this.listLoading = true
      queryBrand(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },

    // 查询过滤器
    handleFilter() {
      this.listQuery.current = 1
      this.queryBrand()
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
      this.queryBrand()
    },
    /**
       * 跳转到指定页
       */
    handleCurrentChange(val) {
      this.listQuery.current = val
      this.queryBrand()
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
       * 弹出创建品牌表单
       */
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.resetForm()
      this.$refs.upload.clearFiles()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    /**
       * 创建品牌
       */
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createBrand(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '创建成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.temp.roleIds = []
            this.queryBrand()
          })
        }
      })
    },
    /**
       * 弹出修改品牌表单
       */
    handleUpdate(id) {
      this.listLoading = true
      getBrand(id).then(response => {
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
       * 修改品牌信息
       */
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateBrand(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '编辑成功',
              message: '编辑成功',
              type: 'success',
              duration: 2000
            })
            this.temp.roleIds = []
            this.queryBrand()
          })
        }
      })
    },
    /**
       * 删除品牌
       */
    deleteData(id) {
      var that = this
      this.oprenConfirm('此操作将删除该品牌,是否继续?', function() {
        deleteBrand(id).then(() => {
          that.oprenNotify(that.queryBrand())
        })
      })
    },

    /**
     * 批量删除
     */
    handleDelete() {
      var that = this
      var selectRows = this.$refs.multipleTable.selection
      if (selectRows.length > 0) {
        this.oprenConfirm('确认要删除选中的' + selectRows.length + '条数据吗', function() {
          var list = []
          selectRows.map((item, index) => {
            list[index] = item.id
          })
          batchDeleteBrand(list).then(() => {
            that.oprenNotify(that.queryBrand())
          })
        })
      }
    },

    /**
     *通用的确认框
     */
    oprenConfirm(title, callBack) {
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
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
