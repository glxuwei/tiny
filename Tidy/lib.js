/**
* 基础函数
* @author will.xu
*/
/**
* @description memorize 缓存函数
* @param {Function} 被缓存的函数
* @return {Function} 返回缓存函数
*/
const memorize = fn => {
    const cache = {};
    return (...args) => {
        const argsKey = JSON.stringify(args);
        if (cache[argsKey]) {
            return cache[argsKey];
        }
        cache[argsKey] = fn.apply(null, args);
        return cache[argsKey];
    }
};

/**
* @description getCamelCase 根据key, prefix值生成fetch key
* @param {String} key 以下划线命名的key值
* @param {String} prefix 前缀
* @return {String}
* @example
* getCamelCase('reservation_config', 'fetch_') ->  'fetchReservationConfig'
*/
const getCamelCase = (key, prefix = '') => {
    return (prefix + key).replace(/_([a-z])/g, ($0, $1) => $1.toUpperCase());
};

/**
* @description pick 获取keys数组中相应key值的对象,并返回这个新对象
* @param {Array} keys 对象key值
* @param {Object} obj 目标对象
* @return {Object} 取出相应值的对象
* @example
*  pick(['name', 'age'], {name: 'zs', age: 12, sex: 'female'}) ->
*  {name: 'zs', age: 12}
*/
const pick = (keys, obj) => {
    return keys.reduce((prev, key) => {
        if (typeof obj[key] !== 'undefined') {
            prev[key] = obj[key];
        }
        return prev;
    }, {});
}

/**
* @description removeArrayItems 移除数组中相应的值，返回新的数组
* @param {Array} items 需要过滤掉的数组中的对象
* @param {Array} ary 目标数组
* @return {Array} 过滤后的数组
* @example
* removeArrayItems(['zs', 'ls'], ['ww', 'zs', 'zl']) -> ['ww', 'zl']
*/
const removeArrayItems = (items, ary) => {
    return ary.filter(item => {
        return !~items.indexOf(item);
    });
};

/**
* @description removeObjectKeys 移除对象obj存在于数组keys中的key值，并返回新的对象
* @param {Array} keys 需要过滤掉的key值
* @param {Object} obj 目标对象
* @return {Object} 过滤后的对象
* @example
* removeObjectKeys(['name', 'age'], {name: 'zs', age: 12, sex: 'female'}) -> {sex: 'female'}
*/
const removeObjectKeys = (keys, obj) => {
    const objKeys = Object.keys(obj);
    return pick(removeArrayItems(keys, objKeys), obj);
}

/**
* @description mergeArray 数组merge去重
* @param {Array} ary 合并数组
* @param {Array} target 基准数组
* @param {Function|String} getKey 生成key的函数或者key值，默认为id
* @return {Array} merge后的数组
* @example
* 1. getKey为函数 getKey = obj => obj.name + obj.age 表示以每个对象中的name和age值标志该数组的唯一性
* mergeArray([{name: 'zs', age: 11}, {name: 'ww', age: 12}], [{name: 'zs', age: 11}, {name: 'ww', age: 13}], obj => obj.name + obj.age) ->
* [{name: 'zs', age: 11}, {name: 'ww', age: 12}, {name: 'ww', age: 13}]
* 2. getKey为字符串 getKey = 'id'
* mergeArray([{id: 1, name: 'zs', age: 11}, {id: 2, name: 'ww', age: 2}], [{id: 1, name: 'zs', age: 11}, {id: 2, name: 'ww', age: 13}], 'id') ->
* [{id: 1, name: 'zs', age: 11}, {id: 2, name: 'ww', age: 13}] 注意以target为基准, age为13， 而不是2
*/
const mergeArray = (ary, target, getKey) => {
    const hash = {};
    return target.concat(ary).reduce((prev, item, index) => {
        const key = typeof getKey === 'function' ? getKey(item) : item[getKey || 'id'];
        if (!hash[key]) {
            hash[key] = true;
            prev.push(item);
        }
        return prev;
    }, []);
};

/**
* @description indexOf 获取满足相应条件的索引
* @param {Array} ary 目标数组
* @param {Function} fn 条件函数
* @return {Number} 符合条件的索引，默认-1
* @example
* indexOf([{id: 1, name: 'zs', age: 11}, {id: 2, name: 'ww', age: 2}], item => item.age === 2) -> 1
*/
const indexOf = (ary, fn, init = -1) => ary.reduce((prev, item, index) => {
    if(fn(item)) {
        prev = index;
    }
    return prev;
}, init);

/**
* @description ellipsis 字符串截取
* @param {String} str 目标字符串
* @param {Number} num 截取个数, 默认4
* @return {String} 返回截取后的字符串
* @example
* ellipsis('1ldla', 2) -> '1l...'
*/
const ellipsis = (str = '', num = 4) => str.length > num ? str.slice(0, num) + '...' : str;

/**
* @description timeout 延迟promise
* @param {Number} time 延迟毫秒数 默认3000
* @return {Promise} time毫秒后resolve的promise
*/
const timeout = (time = 3000) => new Promise(resolve => {
    const timer = setTimeout(() => {
        resolve();
        clearTimeout(timer);
    }, time);
});

/**
* @description noop 空函数
*/
const noop = () => {};

/**
* @description identity id函数
*/
const identity = n => n;

/**
* @description push
* 调用Array的push方法时直接 返回当前Array
* @param {*} 任意值
* @parma {Array}
*/
const push = (item, ary) => {
    if (Array.isArray(ary)) {
        ary.push(item);
    }
    return ary;
}

export { memorize, getCamelCase, pick, removeObjectKeys, mergeArray, push, indexOf, ellipsis, timeout, identity, noop};
