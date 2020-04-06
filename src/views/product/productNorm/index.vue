<template>
  <div class="app-container">
    <div class="filter-container">

      <!--查询条件-->
      <el-input v-model="listQuery.name" style="width: 200px;" class="filter-item" placeholder="规格名称" @keyup.enter.native="handleFilter" />
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
  <!--    <el-button v-waves class="filter-item" type="primary" icon="el-icon-delete" :loading="downloadLoading" @click="handleDelete">
        删除
      </el-button> -->
    </div>

    <!--列表-->
      <el-table
        ref="multipleTable"
        v-loading.body="listLoading"
        :data="list"
        style="width: 100%"
        row-key="id"
        border
        lazy
        :load="load"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column  label="ID">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="规格">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column  label="排序">
          <template slot-scope="scope">
            <span>{{ scope.row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column width="160px" align="center" label="创建时间">
          <template slot-scope="scope">
            <span>{{ scope.row.createdTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="修改人">
          <template slot-scope="scope">
            <span>{{ scope.row.createdBy }}</span>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="100px" status-icon style="width: 80%; margin-left:60px;">
        <el-form-item label="规格名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入规格名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="temp.sort" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item   v-for="(item,index) in temp.attr" >
            <el-form-item label="属性" required>
              <el-col :span="5" style="margin-right: 5upx;">
                <el-form-item  prop="name" :rules="[{required: true,message: '属性名必填',trigger: 'blur'},{min: 1,max: 20,message: '属性名长度在1到20个字符',trigger: 'blur'}]">
                  <el-input v-model="item.name" placeholder="请输入属性名" />
                </el-form-item>
              </el-col>
              <el-col :span="5" style="margin-right: 5upx;">
                <el-form-item prop="imageUrl">
                 <el-input v-model="item.imageUrl" placeholder="图片地址" />
                </el-form-item>
              </el-col>
              <el-col :span="5" style="margin-right: 5upx;">
                <el-form-item prop="sort" >
                  <el-input v-model="item.sort" placeholder="请输入属性排序" />
                </el-form-item>
              </el-col>
              <el-col :span="5" style="margin-right: 5upx;">
                <el-button type="warning" icon="el-icon-plus" circle @click="addAttrHandle"></el-button>
                <el-button type="danger" icon="el-icon-delete" circle @click="minusAttrHandle(index)"></el-button>
              </el-col>
            </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="addAttrHandle">增加规格属性</el-button>
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
  queryNorm,
  getNorm,
  createNorm,
  updateNorm,
  deleteNorm,
  batchDeleteNorm
} from '@/api/product/productNorm'
import waves from '@/directive/waves'

export default {
  name: 'ResourceManagement',
  // 水波文效果
  directives: {
    waves
  },
  filters: {

  },
  data() {
    return {
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
      //存放请求方式集合
      methodList:[],
      dialogStatus: 'create',
      dialogFormVisible: false,
      // 表单校验规则
      rules: {
        name: [{
          required: true,
          message: '规格名必填',
          trigger: 'blur'
        },
        {
          min: 1,
          max: 20,
          message: '规格名长度在1到20个字符',
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
        ]

      },
      // 创建或修改用户临时对象
      temp: {}
    }
  },
  // 页面加载完成后显示列表页
  created() {
    this.queryNorm()
    this.resetForm()
  },
  methods: {
    /**
       * 规格列表
       */
    queryNorm() {
      this.listLoading = true
      queryNorm(this.listQuery).then(response => {
        this.list = response.data.records
       // if(this.list){
       //   this.list.map(item =>{this.$set(item,"hasChildren",true)})
       // }
        this.total = response.data.total
        this.listLoading = false
      })
    },
    load(tree, treeNode, resolve) {
      console.log(tree.id)

      setTimeout(() => {
        resolve([
          // {
          //   id: 31,
          //   date: '2016-05-01',
          //   name: '王小虎',
          //   address: '上海市普陀区金沙江路 1519 弄'
          // }, {
          //   id: 32,
          //   date: '2016-05-01',
          //   name: '王小虎',
          //   address: '上海市普陀区金沙江路 1519 弄'
          // }
        ])
      }, 1000)
    },

     // 查询过滤器
    handleFilter() {
      this.listQuery.current = 1
      this.queryNorm()
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
      this.queryNorm()
    },
    /**
       * 跳转到指定页
       */
    handleCurrentChange(val) {
      this.listQuery.current = val
      this.queryNorm()
    },
    /**
       * 重置添加表单
       */
    resetForm() {
      this.temp = {
        sort: 1,
        name: '',
        attr:[{}]
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
    addAttrHandle(){
      this.temp.attr.push({name:"",sort:1})
    },
    /**
       * 创建权限
       */
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createNorm(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '创建成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.temp.roleIds = []
            this.queryNorm()
          })
        }
      })
    },
    /**
       * 弹出修改权限表单
       */
    handleUpdate(id) {
      this.listLoading = true
      getNorm(id).then(response => {
        this.temp = response.data
        console.log(this.temp)
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
          console.log(this.temp)
          updateNorm(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '编辑成功',
              message: '编辑成功',
              type: 'success',
              duration: 2000
            })

            this.queryNorm()
          })
        }
      })
    },
    /**
       * 删除权限
       */
    deleteData(id) {
      var that = this
        this.oprenConfirm("此操作将删除该权限,是否继续?",function(){
          deleteNorm(id).then(() => {
            that.oprenNotify(that.queryNorm())
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
          batchDeleteNorm(list).then(() => {
           that.oprenNotify(that.queryNorm())
          })
        })
      }

    },
    minusAttrHandle(index){
      this.temp.attr.splice(index,1)
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
