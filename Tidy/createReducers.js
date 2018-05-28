/**
* 生成适用于fetch 的 reducer
* 可减少很多重复的reducer代码
* @author will.xu
* @providesModule createReducers
*/
const { combineReducers } = Ext.Redux;
import { getFetchTypesAry } from '../constants/fetchKeys';
import { getCamelCase, removeObjectKeys, identity } from 'utils';

const fetchInitialState = {
    loading: false,
    error: null,
    data: null,
    extra: null
};

/**
 * @description createFetchReducerHandler 内部方法，创建fetch reducer对象
 * @param {String} key fetchKeys  fetchKeyMap中的key值
 * @param {String} filterKeys 调用createReducers时，传入的?后面的过滤节点
 * @return {Object}
 * @example
 * createFetchReducerHandler('ota_page', 'props1&props2') ->
 * {
 *      FETCH_OTA_PAGE_START: (state, action) => {},
 *      FETCH_OTA_PAGE_SUCCESS: (state, action) => {},
 *      FETCH_OTA_PAGE_FAIL: (state, action) => {}
 * }
 */
const createFetchReducerHandler = (key, filterKeys) => {

    return getFetchTypesAry(key).reduce((prev, key, index) => {
        prev[key] = (state, action) => {
            const { code, loading = false, error = null, payload = null, extra } = action || {};
            const nextState = {
                ...state,
                code,
                error,
                data: payload,
                extra,
                loading,
                timestamp: Date.now()
            };
            if (typeof filterKeys === 'string') {
                if (filterKeys !== '' && payload && index === 1) {
                    //state中不存储返回的payload的key值
                    const removeKeys = filterKeys.split('&');
                    nextState.data = removeObjectKeys(removeKeys, payload);
                }
            }
            return nextState;
        };
        return prev;
    }, {});
};

/**
 * @description createReducer 创建单个reducer
 * @param {String|Object} key fetchKeys中fetchKeyMap中的key值或者为初始state
 * @param {String|Object} initialState=[{}|'prop1&prop2']
 * @param {Boolean} type=[true|false] 判断初始化对象是merge还是替换fetchInitialState
 * @return {Function} reducer
 * @example
 *  1. 创建单个普通reducer, 区别于fetch reducer
 *     export default createReducer({abc: 'def'}).action('ABC_DEF', (state, action) => {})
 *  2. 创建单个fetch reducer, 初始state为fetchInitialState
 *     export default createReducer('ota_page').action('FETCH_OTA_PAGE_SUCCESS', (state, action) => {});
 *  3. 创建单个fetch reducer, 传入初始state替换fetchInitialState
 *     export default createReducer('ota_page', {abc: 'def'}).action('FETCH_OTA_PAGE_SUCCESS', (state, action) => {});
 *  4. 创建单个fetch reducer, 传入初始state merge fetchInitialState
 *     export default createReducer('ota_page', {abc: 'def'}, 1).action('FETCH_OTA_PAGE_SUCCESS', (state, action) => {});
 *  5. 作为内部方法，供createReducers使用，批量创建fetch reducers
 *     createReduer('ota_page', 'prop1&prop2')
 *
 */
const createReducer = (key, initialState, type) => {

    //自定义reducer,如调用action方法时，存储handler处理函数
    let reducerHandlerCache = {};
    let filterKeys;

    //创建fetch reducer
    if (typeof key === 'string') {
        if (typeof initialState === 'string') {
            filterKeys = initialState;
            initialState = fetchInitialState;
        } else {
            //type为true时， 参数state与默认的state merge，
            //type为false时，参数state存在则初始化state取参数state，
            //否则取默认state
            initialState =  initialState ? type ? {...fetchInitialState, ...initialState} : initialState : fetchInitialState;
        }
        reducerHandlerCache = {
            ...createFetchReducerHandler(key, filterKeys),
            ...reducerHandlerCache
        };
    } else {
        //创建普通reducer
        initialState = key || {};
    }

    const reducer = (state = initialState, action) => {
        return (reducerHandlerCache[action.type] || identity )(state, action);
    };

    reducer.action = (type, handler) => {
        reducerHandlerCache[type] = handler;
        return reducer;
    };
    return reducer;
};

/**
 * @description createReducers 批量创建reducers
 * @param {String|Object} key fetchKeys中fetchKeyMap中的key值或者为初始state
 * @return {Function} reducer
 * @example
 * 创建fetch reducer, list, addReserve, 其中list对象过滤掉节点为allFilters和
 * sortList对象里面的数据，如若只写? list? 则过滤掉请求成功data节点下所有数据
 * 该state节点下仅会保存请求的状态数据, 最后一个参数为对象，如同combineReducers({})用法
 * export default createReducers('list?allFilters&sortList','add_reserve', {
 *     sort, filter, dateBar,recommend, squaredRecommend, reserveCount
 * });
 * 返回的对象:
 * combineReducers({list, addReserve: ..., sort, ...})
 */
const createReducers = (...args) => {
    return combineReducers(args.reduce((prev, item) => {
        if (typeof item === 'string') {
            const keySplit = item.split('?');
            const key = keySplit[0];
            return {
                ...prev,
                [getCamelCase(key)]: createReducer(key,  keySplit[1])
            };
        } else {
            return {
                ...prev,
                ...item
            };
        }
    }, {}));
};

export { createReducer };
export default createReducers;
