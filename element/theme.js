var et = require('element-themex')

// et.watch({
//     config: './element-variables.scss',
//     out: './theme',
// })

et.run({
    config: './element/element-variables.scss',
    out: './element/theme',
    minimize: true,
})