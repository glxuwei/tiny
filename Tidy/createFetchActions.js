/**
 * 创建统一使用的异步action
 * 减少很多重复的创建异步action的代码
 * @author will.xu
 * @providesModule createFetchActions
 */

import request from 'request';
import TYPE from '../constants/actionType';
import fetchKeyMap, { fetchPrefix, fetchSplit, getFetchTypes } from '../constants/fetchKeys';
import mockUrl from '../mock/url';
import { memorize, timeout, getCamelCase, noop, identity } from 'utils';
import { TIMEOUT, REQUEST_STATUS } from '../constants';

/**
* @description 生成ajax参数
* @param {String} serviceType - hotdog T值
* @param {Object} param  - ajax参数
* @param {Number} timeout - 超时设置
* @return {Object} 返回请求参数
*/
/* const getFetchParams = (serviceType, param, timeout = TIMEOUT) => { */
    // return {
        // serviceType,
        // timeout,
        // param
    // };
/* }; */

/**
* @description createFetchAction 生成异步action 规避重复创建相同逻辑的异步action的情况
* @param {String} type - 异步action key值
* @param {Object} param - ajax请求参数
* @param {Function} dispatch - redux dispatch
* @return {Function} 派发action
* @example
*  1. 生成fetchAction
*     export default createFetchAction('ota_page')
*  2. 在view中引入
*     import fetchOtaPage from '...';
*  3. mapDispatchToProps
*  4. 调用
*     this.props.fetchOtaPage(参数1, 参数2, successCallback, failCallback)
*     参数1如果为function, 则为successCallback, 此种情况下failCallback 为参数2,
*     参数1不为function，参数2为function， 参数2为successCallback, 此种情况下，参数3为failCallback
*     参数1，2均不为function, 则为param, extra
*     参数2为额外参数如{isMock: true} 表示采用mock数据
*     mock url在mock文件夹下url.js中配置
*/


const createFetchAction = (type = '') => (param, extra, successCallback = noop, failCallback = noop) => dispatch => {
    if (typeof param === 'function') {
        successCallback = param;
        failCallback = extra || noop;
        param = {};
        extra = null;
    } else {
        if (typeof extra === 'function') {
            failCallback = successCallback;
            successCallback = extra;
            extra = null;
        }
    }
    const types = getFetchTypes(type);

    //isMock为true表示采用mock数据
    //loading:fetch_${type}_start loading值, 默认true
    //mockDelayTime: 模拟mock延迟时间
    //requestTimeout: 请求超时时间，默认30000
    //shouldDispatch: 是否触发success dispatch, 默认 true
    //shouldDispatchError: 错误请求下是否触发请求
    //defaultData: 设置请求失败默认值
    //fliter: 自定义过滤成功data
    //customDispatch: 自定义dispatch
    const { isMock, loading, mockDelayTime = 0, requestTimeout = TIMEOUT,
        shouldDispatch = true, shouldDispatchError = true, defaultData,
        filter = identity, testSuccess, customDispatch = noop
    } = extra || {};
    dispatch({
        type: TYPE[types.start],
        loading: typeof loading === 'undefined' ? true : loading,
        extra
    });
    let req = null;
    if (isMock) {
        const url = mockUrl[type];
        let mockParams = url;
        if (typeof url === 'string') {
            mockParams = {
                url
            };
        }
        req = Promise.all([timeout(mockDelayTime), Ext.utils.fetch(mockParams)]).then(res => res[0] || res[1]);
    } else {
        req = request({
            serviceType: fetchKeyMap[type],
            timeout: requestTimeout,
            param,
            testSuccess
        });
    }
    req.then(res => {

        const { bstatus, data } = res || {};
        const { code } = bstatus || {};
        //请求成功
        if(shouldDispatch) {
            dispatch({
                type: TYPE[types.success],
                loading: false,
                code,
                payload: filter(data),
                extra
            });
            successCallback(data);
        }
        customDispatch(res, dispatch);

    }, res => {

        /*
         * 失败分类
         * 1. 请求成功，但后端返回code不为0，此时res为后端返回的数据
         * 2. 接口失败
         * res = {
         *   bstatus: {
         *       des: '',
         *       code: 'RN_REQUEST_ERROR'
         *   }
         * }
         * 3. 请求超时
         * res = {
         *   bstatus: {
         *       des: '请求超时，请稍后再试',
         *       code: 'RN_REQUEST_TIMEOUT'
         *   }
         * }
         *
         **/
        const { bstatus, data} = res || {};
        const { code, des = '' } = bstatus || {};
        if (code !== REQUEST_STATUS.ABORTED) {
         shouldDispatchError && dispatch({
                type: TYPE[types.fail],
                loading: false,
                code,
                payload: defaultData || data,
                error: new Error(des),
                extra
            });
            failCallback(res);
        }
        customDispatch(res, dispatch);
    }).catch(error => {
        //异常捕获, 派发CATCH_RUNTIME_EXCEPTION action
        console.error(error);
        dispatch({
            type: TYPE.CATCH_RUNTIME_EXCEPTION,
            error
        });
    });
};

/**
* @description createFetchActions 根据key值，批量生成异步actions，actions里存放各个异步action
* @param {Array} keys fetch key 数组
* @return {Object} actions对象
* @example
*  1. 调用: export default createFetchActions(['reservation_config', 'user_preferences'])
*  2. 返回: {fetchReservationConfig: param => dispatch  => {}, fetchUserPreferences: ...}
*  3. 相应的视图中引用
*   import fetchActions from '...';
*   const {fetchReservationConfig, fetchUserPreferences} = fetchActions;
*   mapDispatchToProps
*   派发action
*   this.props.fetchReservationConfig();
*   this.props.fetchUserPreferences();
*/
const createFetchActions = keys => keys.reduce((actions, key) => {
    actions[getCamelCase(key, fetchPrefix)] = createFetchAction(key);
    return actions;
}, {});

export default memorize(createFetchActions);
