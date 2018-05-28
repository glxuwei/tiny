/**
* @author will.xu
* @providesModule fetchKeyMap
*/
import { memorize } from './lib';
// fetch action type分隔值
const fetchSplit = ['fetch_|_start', 'fetch_|_success', 'fetch_|_fail'];

//生成action type时，区别fetch type
const fetchPrefix = 'fetch_';

// key: 用于生成actionType，serviceType， reducers, 及 actions
// 约定形式英文字母，以下划线分割单词
// value: hotdog T值
const fetchKeyMap = {
    //获取配置信息
    'ota_page': 'f_flight_rn_otalist',
    //出发城市当前时间
    'dep_current_date': 'f_cityInfo',
    'list': 'f_flight_flightlist',
    'search_history': 'f_flightSearchRecord',
    'reserve_count': 'f_fReserveCount',//请求预约数量
    'recommend': 'f_r_airlineRecommend',
    'add_reserve': 'f_fReserveAdd', //新增低价预约
    'tgq_info':'f_getFlightOtaInfo', //OTA退改签信息
    'luggage_info': 'f_flight_luggageDetail', //OTA行李额详情
    'comment_init_info': 'f_feed_native_comment_list', // 初始评论数据
    'comment_more': 'f_feed_native_list',// 评论查看更多
    'comment_zan': 'f_feed_native_like' //评论点赞
};
const fetchKeys = Object.keys(fetchKeyMap);

const replaceCase = (item, type) => item.replace(/\|/, type).toUpperCase();
/*
 * 生成fetch type对象
 * {
 *      start: 'FETCH_${TYPE}_START',
 *      ...
 * }
 * */

const getFetchTypes = memorize(type => fetchSplit.reduce((prev, item) => {
    prev[item.replace(/^fetch_\|_(\w+)$/, '$1')] = replaceCase(item, type);
    return prev;
}, Object.create(null)));

const getFetchTypesAry = memorize(type => fetchSplit.map(item => replaceCase(item, type)));

export {fetchSplit, fetchPrefix, fetchKeys, getFetchTypes, getFetchTypesAry};
export default fetchKeyMap;

