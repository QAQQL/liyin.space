import axios from 'axios';

const extractCookieValue = (cookies, key) => {
    // 将cookie字符串分割成键值对
    const cookiePairs = cookies.split('; ');
    for (const pair of cookiePairs) {
        // 每个键值对进一步分割成键和值
        if (pair.includes('=')) {
            const [k, v] = pair.split('=', 2);
            // 如果找到了匹配的键，则返回对应的值
            if (k === key) {
                return v;
            }
        }
    }
    // 如果没有找到匹配的键，则返回null
    return null;
}

// 导出通用的请求方法
export const getAchievements = async (cookie) => {
    if (!cookie) {
        return {
            code: 400, message: '解析 cookie 失败，请确认 cookie 是否正确！'
        }
    }

    const device_id = extractCookieValue(cookie, '_MHYUUID');

    if (!device_id) {
        return {
            code: 400, message: '解析 device_id 失败，请确认 cookie 是否正确！'
        }
    }

    const type = extractCookieValue(cookie, '_HYVUUID') !== null ? 'hoyolab' : 'mihoyo'
    const config = {
        hoyolab: {
            url: '/hoyolab/event/rpgcultivate/achievement/list', host: 'sg-public-api.heybox.com', origin: 'https://act.hoyolab.com', referer: 'https://act.hoyolab.com/'
        }, mihoyo: {
            url: '/mihoyo/event/rpgcultivate/achievement/list', host: 'api-takumi.mihoyo.com', origin: 'https://act.mihoyo.com', referer: 'https://act.mihoyo.com/'
        }
    };

    try {
        // 请求 hoyolab 的成就数据
        const response = await axios({
            url: config[type].url, method: 'get', withCredentials: true, params: {
                show_hide: "true", need_all: "true"
            }, headers: {
                'Access-Control-Allow-Origin': '*', 'rewrite-cookie': cookie, 'rewrite-host': config[type].host, 'rewrite-origin': config[type].origin, 'rewrite-referer': config[type].referer, 'x-rpc-device_id': device_id, 'x-rpc-lang': 'zh-cn',
            }
        })
        if (response.status === 200) {
            const retcode = response.data.retcode;
            if (retcode === -100) {
                return {
                    code: 400, message: '请求失败，cookie 无效，请重新获取最新的 cookie！'
                }
            } else if (retcode !== 0) {
                return {
                    code: 401, message: '请求失败，未知异常！'
                }
            }

            return {
                code: 0, message: 'success', data: response.data.data.achievement_list
            }
        } else {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }
    } catch (error) {
        return {
            code: 401, message: error.message
        }
    }
}
