在原来的 TokenBank 添加一个方法 depositWithPermit2()， 这个方式使用 permit2 进行签名授权转账来进行存款。
在本地环境需要大家先部署 Permit2 合约

修改 Token 存款前端 让用户可以在前端通过 permit2 的签名存款。

# npm install @uniswap/permit2-sdk
# npm run dev
