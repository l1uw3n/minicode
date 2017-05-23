import os
import re
import sys
import time
import socks
import socket
import getopt
import chardet
import sqlite3
import webbrowser
from pyquery import PyQuery
from urllib import parse
from urllib import request
from urllib.parse import quote


def get_conn(path):
    '''获取到数据库的连接对象，参数为数据库文件的绝对路径
    如果传递的参数是存在，并且是文件，那么就返回硬盘上面改
    路径下的数据库文件的连接对象；否则，返回内存中的数据接
    连接对象'''
    conn = sqlite3.connect(path)
    if os.path.exists(path) and os.path.isfile(path):
        # print('硬盘上面:[{}]'.format(path))
        return conn
    else:
        conn = None
        # print('内存上面:[:memory:]')
        return sqlite3.connect(':memory:')


def get_cursor(conn):
    '''该方法是获取数据库的游标对象，参数为数据库的连接对象
    如果数据库的连接对象不为None，则返回数据库连接对象所创
    建的游标对象；否则返回一个游标对象，该对象是内存中数据
    库连接对象所创建的游标对象'''
    if conn is not None:
        return conn.cursor()
    else:
        return get_conn('').cursor()

###############################################################
####            创建|删除表操作     START
###############################################################


def drop_table(conn, table):
    '''如果表存在,则删除表，如果表中存在数据的时候，使用该
    方法的时候要慎用！'''
    if table is not None and table != '':
        sql = 'DROP TABLE IF EXISTS ' + table
        # print('执行sql:[{}]'.format(sql))
        cu = get_cursor(conn)
        cu.execute(sql)
        conn.commit()
        # print('删除数据库表[{}]成功!'.format(table))
        close_all(conn, cu)
    else:
        print('the [{}] is empty or equal None!'.format(sql))


def create_table(conn, sql):
    '''创建数据库表：student'''
    if sql is not None and sql != '':
        cu = get_cursor(conn)
        # print('执行sql:[{}]'.format(sql))
        cu.execute(sql)
        conn.commit()
        # print('创建数据库表成功!')
        close_all(conn, cu)
    else:
        print('the [{}] is empty or equal None!'.format(sql))


###############################################################
####            创建|删除表操作     END
###############################################################


def close_all(conn, cu):
    '''关闭数据库游标对象和数据库连接对象'''
    try:
        if cu is not None:
            cu.close()
    finally:
        if cu is not None:
            cu.close()

###############################################################
####            数据库操作CRUD     START
###############################################################


def save(conn, sql, data):
    '''插入数据'''
    if sql is not None and sql != '':
        if data is not None:
            cu = get_cursor(conn)
            for d in data:
                # print('执行sql:[{}],参数:[{}]'.format(sql, d))
                cu.execute(sql, d)
                conn.commit()
            close_all(conn, cu)
    else:
        print('the [{}] is empty or equal None!'.format(sql))


def fetchall(conn, sql):
    '''查询所有数据'''
    if sql is not None and sql != '':
        cu = get_cursor(conn)
        # print('执行sql:[{}]'.format(sql))
        cu.execute(sql)
        r = cu.fetchall()
        if len(r) > 0:
            for e in range(len(r)):
                print(r[e])
    else:
        print('the [{}] is empty or equal None!'.format(sql))


def fetchone(conn, sql, data):
    '''查询一条数据'''
    if sql is not None and sql != '':
        if data is not None:
            # Do this instead
            # d = (data,)
            cu = get_cursor(conn)
            # print('执行sql:[{}],参数:[{}]'.format(sql, data))
            cu.execute(sql, data)
            r = cu.fetchall()
            if len(r) > 0:
                for e in range(len(r)):
                    return r[e]
        else:
            print('the [{}] equal None!'.format(data))
    else:
        print('the [{}] is empty or equal None!'.format(sql))
    return None


def update(conn, sql, data):
    '''更新数据'''
    if sql is not None and sql != '':
        if data is not None:
            cu = get_cursor(conn)
            for d in data:
                # print('执行sql:[{}],参数:[{}]'.format(sql, d))
                cu.execute(sql, d)
                conn.commit()
            close_all(conn, cu)
    else:
        print('the [{}] is empty or equal None!'.format(sql))


def delete(conn, sql, data):
    '''删除数据'''
    if sql is not None and sql != '':
        if data is not None:
            cu = get_cursor(conn)
            for d in data:
                # print('执行sql:[{}],参数:[{}]'.format(sql, d))
                cu.execute(sql, d)
                conn.commit()
            close_all(conn, cu)
    else:
        print('the [{}] is empty or equal None!'.format(sql))
###############################################################
####            数据库操作CRUD     END
###############################################################


def curDir():
    try:
        return os.path.split(os.path.realpath(__file__))[0]
    except Exception as ex:
        return os.getcwd()


def getHTML(url, timeout=5, retry=3, sleep=0, proxy=''):
    proxyDict = {}
    if proxy is not None and re.match(r'^.+@.+:.+$', proxy, flags=0):
        proxyDict['type'] = proxy.split('@')[0]
        proxy = proxy.split('@')[1]
        proxyDict['host'] = proxy.split(':')[0]
        proxyDict['port'] = proxy.split(':')[1]
    if len(proxyDict) > 0 and proxyDict['type'] is not None and proxyDict['type'].lower() == 'socks5':
        socks.set_default_proxy(socks.SOCKS5, proxyDict['host'], int(proxyDict['port']))
        socket.socket = socks.socksocket
    elif len(proxyDict) > 0 and proxyDict['type'] is not None and proxyDict['type'].lower() == 'socks4':
        socks.set_default_proxy(socks.SOCKS4, proxyDict['host'], int(proxyDict['port']))
        socket.socket = socks.socksocket
    elif len(proxyDict) > 0 and proxyDict['type'] is not None and proxyDict['type'].lower() == 'http':
        socks.set_default_proxy(socks.HTTP, proxyDict['host'], int(proxyDict['port']))
        socket.socket = socks.socksocket
    socket.setdefaulttimeout(timeout)
    # url = 'https://www.javbus2.com/HIZ-015'
    # url = "http://img0.imgtn.bdimg.com/it/u=4054848240,1657436512&fm=21&gp=0.jpg"
    # headers = [('User-Agent','Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) \
    # Chrome/23.0.1271.64 Safari/537.11'),
    # ('Accept','text/html;q=0.9,*/*;q=0.8'),
    # ('Accept-Charset','ISO-8859-1,utf-8;q=0.7,*;q=0.3'),
    # ('Accept-Encoding','gzip,deflate,sdch'),
    # ('Connection','close'),
    # ('Referer',None )]#注意如果依然不能抓取的话，这里可以设置抓取网站的host
    headers = [('Host', 'img0.imgtn.bdimg.com'), ('Connection', 'close'), ('Cache-Control', 'max-age=0'), ('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'), ('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36'), ('Accept-Encoding', '*'), ('Accept-Language', 'zh-CN,zh,en-US,en,*;q=0.8'), ('If-None-Match', '90101f995236651aa74454922de2ad74'), ('Referer', 'http://www.deviantart.com/whats-hot/'), ('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT')]

    opener = request.build_opener()
    opener.addheaders = headers
    i = retry
    contents = ''
    while i > 0:
        try:
            time.sleep(sleep)
            data = opener.open(quote(url, safe='/:?=%-&'))
            headertype = str(data.info()['Content-Type']).lower()
            contents = data.read()
            if 'text/' in headertype:
                if 'charset' in headertype:
                    for item in ['utf-8', 'utf8', 'gbk', 'gb2312', 'gb18030', 'big5', 'latin-1', 'latin1']:
                        if item in headertype:
                            chartype = item.upper()
                else:
                    chartype = charDetect(contents)
                contents = contents.decode(chartype, errors='ignore')
            opener.close()
            break
        except Exception as ex:
            opener.close()
            print('getHTML:' + str(ex))
            if '403' in str(ex) or '404' in str(ex) or '11001'in str(ex):
                break
        i -= 1
    return contents


def collect(level, dbfile=os.path.join(curDir(), 'orath.db')):
    '''
      `id` integer PRIMARY KEY autoincrement,   #自增主键
      `class` varchar(10) NOT NULL,             #类别(OCA, OCP, OCM)
      `level` varchar(10) NOT NULL,             #级别(051, 052, 053)
      `db` varchar(20) NOT NULL,                #数据库(oracle 11g, oracle 12c)
      `version` varchar(10) NOT NULL,           #版本(v8.02, v9.02)
      `qn` integer NOT NULL,                    #题号(1, 2, 3)
      `link` varchar(100),                      #链接
      `content` varchar(100000),                #题目内容
      `image` BLOB DEFAULT NULL,                #题目图片
      `options` varchar(100000),                #题目选项
      `parse` varchar(100000),                  #题目解析
      `reference` varchar(100000),              #参考内容
      `answer` varchar(100000),                 #答案
      `skill` integer DEFAULT 0,                #熟练度(答错次数)
      `star` integer DEFAULT 0,                 #星标
      `tmp1` varchar(100),                      #预留1
      `tmp2` varchar(100),                      #预留2
     '''

    create_table_sql = '''CREATE TABLE IF NOT EXISTS `orath` (
                          `id` integer PRIMARY KEY autoincrement,
                          `level` varchar(10) NOT NULL,
                          `db` varchar(20) NOT NULL,
                          `version` varchar(10) NOT NULL,
                          `qn` integer NOT NULL,
                          `link` varchar(100),
                          `content` text,
                          `image` BLOB DEFAULT NULL,
                          `options` text,
                          `parse` text,
                          `reference` text,
                          `answer` text,
                          `skill` integer DEFAULT 0,
                          `star` integer DEFAULT 0,
                          `tmp1` varchar(100),
                          `tmp2` varchar(100)
                        )'''
    iconn = get_conn(dbfile)
    create_table(iconn, create_table_sql)

    idata = []
    isql = 'insert into `orath` values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    fetchTopic(level, idata)
    save(iconn, isql, idata)


def fetchTopic(level, idata):
    if level == '1Z0-051':
        data = PyQuery(getHTML('http://blog.csdn.net/rlhua/article/details/17101765'))
        content = data('#article_content')
        table = content('table')
        items = table('tr:gt(0)')
        for item in items.items():
            qn = str(item('td:eq(0)').text()).strip()
            link = str(item('td:eq(1)').text()).strip()
            idata.append([None, '1Z0-051', 'Oracle 11g r2', 'v9.02', qn.strip(), link, None, None, None, None, None, None, None, None, None, None])

    if level == '1Z0-052':
        data = PyQuery(getHTML('http://blog.csdn.net/rlhua/article/details/16961497'))
        content = data('#article_content')
        table = content('table')
        items = table('tr:gt(1)')

        i = 1001
        tdata = []
        for item in items.items():
            qns = str(item('td:eq(1)').text()).replace('，', ',').strip()
            if ':' in str(item('td:eq(0)').text()):
                link = str(item('td:eq(0)').text()).split('：')[1].strip()
            else:
                link = str(qns.split('：')[1]).strip()
                qns = str(qns.split('：')[0]).strip()
            if qns == '无此题':
                qns = str(i)
                i = i + 1
            for qn in qns.split(','):
                tdata.append([None, '1Z0-052', 'Oracle 11g r2', 'v9.02', qn.strip(), link, None, None, None, None, None, None, None, None, None, None])
        tdata = sorted(tdata, key=lambda x: int(x[4]))
        for d in tdata:
            idata.append(d)


def showTopic(level, qn, dbfile):
    iconn = get_conn(dbfile)
    isql = 'select * from `orath` where `level`=? and `qn`=?'
    res = fetchone(iconn, isql, (level, qn))
    if res is not None:
        link = res[5]
        webbrowser.open(link, new=0, autoraise=True)


def main(argv):
    type = 'show'
    tpath = curDir()
    level = '1Z0-051'
    qn = 1
    if argv is not None and len(argv) > 0:
        try:
            opts, args = getopt.getopt(argv, "ht:d:l:n:", ["type=", "dir=", "level=", "number="])
        except getopt.GetoptError:
            print(
                '''Usage: avfetch.py [-t <type>] [-d <targetpath>] [-l <level>] [-n <number>]\n
                Example: orath.py -t show -d D:/ -l 1Z0-051 -n 10'''
            )
            exit(2)

        if len(args) > 0:
            texts.extend(args)
        for opt, arg in opts:
            if opt == '-h':
                print(
                    '''Usage: avfetch.py [-t <type>] [-d <targetpath>] [-l <level>] [-n <number>]\n
                    Example: orath.py -t show -d D:/ -l 1Z0-051 -n 10'''
                )
                exit()
            elif opt in ("-t", "--type"):
                type = arg
            elif opt in ("-d", "--dir"):
                tpath = arg
            elif opt in ("-l", "--level"):
                level = arg
            elif opt in ("-n", "--number"):
                qn = arg
            else:
                pass
        try:
            if type == 'fetch':
                collect(level, os.path.join(tpath, 'orath.db'))
            if type == 'show':
                showTopic(level, qn, os.path.join(tpath, 'orath.db'))
        except Exception as ex:
            print('main:' + str(ex))


if __name__ == "__main__":
    main(sys.argv[1:])

# main(['-t', 'fetch', '-l', '1Z0-052', '-n', '15'])