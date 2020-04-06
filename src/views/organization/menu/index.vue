<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button-group>
        <el-button type="primary" icon="plus" @click="handlerAdd">添加</el-button>
        <el-button type="primary" icon="edit" @click="handlerUpdate">编辑</el-button>
        <el-button type="primary" icon="delete" @click="handlerDelete">删除</el-button>
      </el-button-group>
    </div>

    <el-row>
      <el-col :span="8" style="margin-top:15px;">
        <el-tree
          id="el-cascader"
          class="filter-tree"
          node-key="id"
          highlight-current
          lazy
          :load="loadNode"
          :data="treeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          :default-expand-all="true"
          @node-click="getNodeData"
        />
      </el-col>

      <el-col :span="14" style="margin-top:15px;">
        <el-card class="box-card">
          <el-form ref="form" :rules="rules" :label-position="labelPosition" label-width="100px" :model="form">
            <!-- <el-form-item label="节点id" prop="id">
              <el-input v-model="form.id" :disabled="formRead" placeholder="节点编号"></el-input>
            </el-form-item> -->
            <!-- <el-form-item label="父级节点" prop="parentId">
              <el-input v-model="form.parentId" :disabled="formRead" placeholder="请选择父级节点" />
            </el-form-item> -->
            <el-form-item label="父级节点">
              <el-cascader
                v-model="shelectValue"
                :options="options"
                :change-on-select="true"
                :size="mini"
                placeholder="请选择父级节点"
                :disabled="cascaderDisabled"
                clearable
                @change="handlItemChange"
                @active-item-change="handlItemChange"
              />
            </el-form-item>
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" :disabled="formRead" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="简介" prop="description">
              <el-input v-model="form.description" :disabled="formRead" />
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-input v-model="form.type" :disabled="formRead" />
            </el-form-item>
            <el-form-item label="菜单路径" prop="href">
              <el-input v-model="form.href" :disabled="formRead" />
            </el-form-item>
            <el-form-item label="图标" prop="icon">
              <el-input v-model="form.icon" :disabled="formRead" />
            </el-form-item>
            <el-form-item label="排序" prop="orderNum">
              <el-input v-model="form.orderNum" :disabled="formRead" />
            </el-form-item>
            <!-- <el-form-item label="创建时间" prop="description">
              <el-input v-model="form.createdTime" disabled />
            </el-form-item>
            <el-form-item label="创建人" prop="description">
              <el-input v-model="form.createdBy" disabled />
            </el-form-item>
            <el-form-item label="修改时间" prop="description">
              <el-input v-model="form.updatedTime" disabled />
            </el-form-item>
            <el-form-item label="修改人" prop="description">
              <el-input v-model="form.updatedBy" disabled />
            </el-form-item> -->

            <el-form-item>
              <el-button type="primary" @click="saveGroup">保存</el-button>
              <!-- <el-button @click="onCancel">取消</el-button> -->
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import { fetchGroupByParentId, getGroup, updateGroup, createGroup, getTree, deleteMenu } from '@/api/organization/menu'

export default {
  name: 'MenuManagement',
  filters: {},
  data() {
    return {
      total: 0,
      listLoading: true,
      // 当前选中的节点id
      currentId: '',
      formEdit: false,
      formRead: !this.formEdit,
      formStatus: '',
      // 树数据
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      labelPosition: 'right',
      form: {
        parentId: undefined,
        id: undefined,
        name: '',
        description: '',
        createdTime: '',
        createdBy: '',
        updatedTime: '',
        updatedBy: ''
      },
      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '菜单名必填', trigger: 'blur' },
          { min: 3, max: 10, message: '菜单名长度在3到10个字符', trigger: 'blur' }
        ],
        type: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
        href: [{ required: true, message: '菜单路径为必填', trigger: 'blur' }]
      },
      options: [], // 级联选择器数据
      optionsbak: [], // 级联选择器数据备份，用于重置树形结构数据
      shelectValue: [], // 级联选择器当前选中
      cascaderDisabled: true// 级联选择器是否可用
    }
  },
  created() {
    this.fetchGroupByParentId('-1')
  },
  methods: {
    /**
     * 菜单树的级联选择后触发
     */
    handlItemChange(parentList) {
      if (parentList.length <= 0) {
        this.form.parentId = ''
        return
      }
      if (parentList.length == 1) {
        this.form.parentId = parentList[0]
      } else {
        this.form.parentId = parentList[parentList.length - 1]
      }
    },

    /**
       * 查询树形结构
       *
       */
    getTree() {
      getTree().then(response => {
        // this.treeData = response.data
        this.options = response.data
        this.optionsbak = response.data
      })
    },
    /**
     * 设置树形结构内当前资源不可用
     * @param {Object} parentId
     */
    setTreeDisable() {
      var that=this
      this.options = this.optionsbak

      function childrenEach(childrenData, id) {
        for (var j = 0; j < childrenData.length; j++) {
          if (childrenData[j].id == id) {
            that.$set(childrenData[j], 'disabled', true,) // 将目前匹配的数组，截断并保存到结果数组，
            break
          } else {
            if (childrenData[j].children) {
              childrenEach(childrenData[j].children, id)
            }
          }
        }
      }
      childrenEach(this.options, this.form.id)
    },

    /**
       * 根据父节点id，查询子节点
       * @param parentId 父节点id
       */
    fetchGroupByParentId(parentId) {
      fetchGroupByParentId(parentId).then(response => {
        this.treeData = response.data
      })
      this.getTree()
    },
    /**
       * 保存组
       */
    saveGroup() {
      this.$refs['form'].validate((valid) => {
        if (this.formEdit) {
          // 修改
          updateGroup(this.form).then(response => {
            if (response.code != '000000') {
              this.$notify({
                title: response.mesg,
                message: response.data,
                type: 'error',
                duration: 3000
              })
            } else {
              this.$notify({
                title: response.mesg,
                message: response.data,
                type: 'success',
                duration: 3000
              })
              this.formRead = true
              this.fetchGroupByParentId('-1')
            }
          })
        } else {
          // 添加
          createGroup(this.form).then(response => {
            if (response.code != '000000') {
              this.$notify({
                title: response.mesg,
                message: response.data,
                type: 'error',
                duration: 3000
              })
            } else {
              this.$notify({
                title: response.mesg,
                message: response.data,
                type: 'success',
                duration: 3000
              })
              this.formRead = true
              this.fetchGroupByParentId('-1')
            }
          })
        }


      }
      )
    },
    handlerAdd() {
      this.formEdit = false
      this.formRead = false
      this.cascaderDisabled = false
      this.shelectValue = []
      this.form = {}
    },
    handlerUpdate() {
      this.formEdit = true
      this.formRead = false
      this.cascaderDisabled = false
    },
    handlerDelete() {
      var id = this.form.id
      this.$confirm('此操作将删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        center: true,
        type: 'warning'
      }).then(() => {
        deleteMenu(id).then(() => {
          this.$notify({
            title: '删除成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.fetchGroupByParentId('-1')
        })
      })
    },
    onCancel() {

    },
    /**
       * 加载树数据
       * @param node 树节点
       * @param resolve
       *
       */
    loadNode(node, resolve) {
      fetchGroupByParentId(node.data.id).then(response => {
        resolve(response.data)
      })
    },
    /**
       * 获取节点数据
       * @param data
       */
    getNodeData(data) {
      this.cascaderDisabled = true
      if (!this.formEdit) {
        this.formStatus = 'update'
      }
      getGroup(data.id).then(response => {
        this.form = response.data
        this.shelectValue = this.changeParentSelect(response.data.parentId, this.options)
        // this.setTreeDisable()
      })
      this.currentId = data.id
      this.formRead = true
    },
    /**
     * 级联选择器回显
     * @param {Object} key  父ID
     * @param {Object} treeData
     */
    changeParentSelect(key, treeData) {
      const arr = [] // 在递归时操作的数组
      let returnArr = [] // 存放结果的数组
      let depth = 0 // 定义全局层级
      // 定义递归函数
      function childrenEach(childrenData, depthN) {
        for (var j = 0; j < childrenData.length; j++) {
          depth = depthN // 将执行的层级赋值 到 全局层级
          arr[depthN] = (childrenData[j].id)
          if (childrenData[j].id == key) {
            returnArr = arr.slice(0, depthN + 1) // 将目前匹配的数组，截断并保存到结果数组，
            break
          } else {
            if (childrenData[j].children) {
              depth++
              childrenEach(childrenData[j].children, depth)
            }
          }
        }
        return returnArr
      }
      return childrenEach(treeData, depth)
    },

    /**
       * 搜索node节点
       */
    filterNode() {
    }

  }
}
</script>
