/**
* 创建常量方法
* @author will.xu
* @providesModule createConstants
* */
import { fetchSplit, fetchPrefix } from './fetchKeys';

/**
* @description createConstants 创建常量方法
* @param {String}
* @return {Object}
* @example
*   createConstant('user_name', 'fetch_get_user');
*   返回： {
*       'USER_NAME': 'USER_NAME',
*       'FETCH_GET_USER_START': 'FETCH_GET_USER_START',
*       'RECEIVE_GET_USER_SUCCESS': 'RECEIVE_GET_USER_SUCCESS',
*       'RECEIVE_GET_USER_FAIL': 'RECEIVE_GET_USER_FAIL',
*   }
*   @author will.xu
*   @providesModule createConstants
*/
export default (...args) => args.reduce((res, cur) => {
    let type = cur;
    if (cur.indexOf(fetchPrefix) > -1) {
        type = cur.replace(fetchPrefix, '');
        fetchSplit.forEach(item => {
            const fetchType = item.replace(/\|/, type).toUpperCase();
            res[fetchType] = fetchType;
        });
    } else {
        type = type.toUpperCase();
        res[type] = type;
    }
    return res;
}, Object.create(null));

