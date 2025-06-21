eslint 不能升级为 9.* 版本，否则 `npm start` 会报以下错误

```bash
Compiled with problems:X

ERROR

Invalid Options:
- Unknown options: extensions, resolvePluginsRelativeTo
- 'extensions' has been removed.
- 'resolvePluginsRelativeTo' has been removed.


ERROR

  Error: Child compilation failed:
  Invalid Options:
  - Unknown options: extensions, resolvePluginsRelativeTo
  - 'extensions' has been removed.
  - 'resolvePluginsRelativeTo' has been removed.
  
  - child-compiler.js:169 
    [hel-mono]/[html-webpack-plugin@5.5.0_webpack@5.64.4]/[html-webpack-plugin]/    lib/child-compiler.js:169:18
  
  - Compiler.js:559 
    [hel-mono]/[webpack@5.64.4]/[webpack]/lib/Compiler.js:559:11
  
  - Compiler.js:1129 
    [hel-mono]/[webpack@5.64.4]/[webpack]/lib/Compiler.js:1129:17
  
  
  - task_queues:95 process.processTicksAndRejections
    node:internal/process/task_queues:95:5
```