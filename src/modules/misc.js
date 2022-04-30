import mod from "../core.js";
import {
    $, judge_problem, lg_dat, lg_content,
} from "../utils.js";
import svg_exit from "../resources/image/exit.svg";

import hidesol_css from "../resources/css/hide-solution.css";
import backtocont_css from "../resources/css/back-to-contest.css";

mod.reg("dbc-jump", "双击题号跳题", "@/.*", null, () => {
    $(document).on("dblclick", (e) => {
        const pid = window.getSelection().toString().trim().toUpperCase();
        const url = e.ctrlkey
            ? `${$(".ops > a[href*=blog]").attr("href")}solution-`
            : "https://www.luogu.com.cn/problem/";
        if (judge_problem(pid)) window.open(url + pid);
    });
}, `
`, "module");

mod.reg("hide-solution", "隐藏题解", ["@/problem/[A-Z0-9]+", "@/problem/solution/.*"], { // Note: 为了避免识别成题目列表
    hidesolu: { ty: "boolean", dft: false, priv: true },
    on: { ty: "boolean", dft: false },
}, () => /@\/problem\/[A-Z0-9]+/g.test(location.href) && $("a[href^=\"/problem/solution\"]").addClass("sol-btn"), hidesol_css, "module");

mod.reg_hook_new("back-to-contest", "返回比赛列表", [
    "@/problem/[A-Z0-9]+\\?contestId=[1-9][0-9]{0,}",
], null, ({ args }) => {
    const { $info_rows } = args,
        $pre = $(`<a class="exlg-back-to-contest"></a>`),
        { cid } = args,
        { pid } = args;
    if ((!pid) || (!cid)) return;
    if ($info_rows.children(".exlg-back-to-contest").length > 0) return; // Note: 防止重复
    $pre.attr("href", `/contest/${cid}#problems`)
        .html(`${svg_exit}返回列表`)
        .appendTo($info_rows);
}, (e) => {
    const tar = e.target,
        cid = lg_dat.contest.id,
        { pid } = lg_dat.problem;
    return { args: { cid, pid, $info_rows: $(tar.parentNode) }, result: (tar.tagName.toLowerCase() === "a" && (tar.href || "").includes("/record/list") && tar.href.slice(tar.href.indexOf("/record/list")) === `/record/list?pid=${pid}&contestId=${cid}`) };
}, () => ({ cid: lg_dat.contest.id, pid: lg_dat.problem.pid, $info_rows: $(".info-rows").parent() }), backtocont_css, "module");

mod.reg_hook_new("submission-color", "记录难度可视化", "@/record/list.*", {
    reload: { ty: "boolean", dft: true, info: ["Always reload data", "翻页时总是重新加载数据"] },
}, ((data) => async ({ msto, args }) => {
    const load = async (pid_tag) => {
        if (!(location.href in data)) { // Note: 如果当前页面未曾加载数据
            if (msto.reload) Object.getOwnPropertyNames(data).forEach((prop) => delete data[prop]); // Note: 清空所有数据
            data[location.href] = lg_content(location.href); // Note: 则创建异步 AJAX 任务
        }
        $(pid_tag).addClass("exlg-difficulty-color").addClass(`color-${(await data[location.href]).currentData.records.result.filter( // Note: 等待异步获取完成
            (record) => record.problem.pid === pid_tag.innerText.trim(), // Note: 根据 PID 筛选当前题目
        )[0].problem.difficulty}`);
    };
    if (args) load(args.pid_tag); // Note: 标签插入时
    else $(".pid").each((i, tag) => load(tag)); // Note: 页面加载完成时
})({
    [location.href]: unsafeWindow._feInjection, // Note: 初始数据位于 feInjection，当前页不必通过 AJAX 获取
}), (e) => {
    if (
        e.target && e.target.tagName.toLowerCase() === "a"
        && /^\/problem\/[A-Z][A-Z0-9]+$/.exec(new URL(e.target.href).pathname) // Note: 如果插入的是题目链接
    ) return { result: true, args: { pid_tag: e.target.firstChild } };
    return { result: false };
}, () => null, `
`, "module");

mod.reg("mainpage-discuss-limit", "主页讨论个数限制", ["@/"], {
    max_discuss: {
        ty: "number", dft: 12, min: 4, max: 16, step: 1, info: ["Max Discussions On Show", "主页讨论显示上限"], strict: true,
    },
}, ({ msto }) => {
    let $discuss;
    if (location.href.includes("blog")) return; // Note: 如果是博客就退出
    $(".lg-article").each((_, e, $e = $(e)) => {
        const title = e.childNodes[1];
        if (title && title.tagName.toLowerCase() === "h2" && title.innerText.includes("讨论")) $discuss = $e.children(".am-panel");
    });
    $discuss.each((i, e, $e = $(e)) => {
        if (i >= msto.max_discuss) $e.hide();
    });
}, `
`, "module");

mod.reg("user-css", "自定义样式表", ".*", {
    css: { ty: "string" },
}, ({ msto }) => GM_addStyle(msto.css), `
`, "module");
