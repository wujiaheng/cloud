import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  username:"",
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_USERNAME:(state,username) =>{
    state.username = username
  },
  SET_USERNAME:(state,username) =>{
    state.username = username
  },
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        commit('SET_TOKEN', response.access_token)
        commit('SET_USERNAME', username.trim())
        setToken(response.access_token)
        resolve()
      }).catch(error => {
        console.error(error)
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {

    return new Promise((resolve, reject) => {
      // getInfo(state.token).then(response => {
      getInfo(state.username).then(response => {
        const { data } = response
        // console.log(response)
        if (!data) {
          reject('身份认证失败，请重新登录.')
        }

        const { name, description } = data

        // roles must be a non-empty array
        // if (!roleIds || roleIds.length <= 0) {
        //   reject('getInfo: roles must be a non-null array!')
        // }

        commit('SET_ROLES', response.data.roleIds)
        commit('SET_NAME', name)
        commit('SET_AVATAR', 'https://avatars3.githubusercontent.com/u/3946731?s=460&v=4')
        commit('SET_INTRODUCTION', description)
        data.roles = response.data.roleIds
        resolve(data)

      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
