import { byUserId, byWeiboId, byTopic, bySuperTopic, byNovel } from "./mod.ts";

Deno.test("userid", async () => {
  console.assert(!!await byUserId("5674400262"));
});

Deno.test("userid:page", async () => {
  let id = "5674400262";
  let r = await byUserId(id);
  console.assert(!!r);
  // if (r) {
  console.log(r?.list.map((i) => i.id));
  r = await byUserId(id, r?.next);
  console.log(r?.list.map((i) => i.id));
  // }
});

Deno.test("userid:invalid", async () => {
  let r = await byUserId("abc");
  console.assert(r == null);
});

Deno.test("status", async () => {
  console.assert(!!await byWeiboId("4460970036406983"));
});

Deno.test("topic", async () => {
  console.assert(!!await byTopic("约拍"));
});

Deno.test("super", async () => {
  console.assert(!!await bySuperTopic("写真"));
});

Deno.test("novelty", async () => {
  console.assert(!!await byNovel("7593674566868993"));
});
