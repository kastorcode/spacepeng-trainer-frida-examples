function ndkHookingCFunctionByAddress (libName = 'libnative-lib.so', offset = 0x8d6c) {
  const strcmp = Module.getBaseAddress(libName).add(offset)
  Interceptor.attach(strcmp, {
    onEnter: function (args) {
      send('onEnter (args[0]) = ' + Memory.readUtf8String(args[0]))
      send('onEnter (args[1]) = ' + Memory.readCString(args[1]))
    },
    onLeave: function (returnValue) {
      send('onLeave (returnValue) = ' + returnValue.toInt32())
    }
  })
}


function ndkHookingCFunctions (libName = 'libnative-lib.so') {
  const imports = Module.enumerateImports(libName)
  const strcmp = imports.find(({ name }) => name.includes('strcmp'))
  let flag = false
  Interceptor.attach(strcmp.address, {
    onEnter: function (args) {
      flag = Memory.readUtf8String(args[1])
      if (flag.includes('FLAG')) {
        send('onEnter (args[0]) = ' + Memory.readCString(args[0]))
        send('onEnter (args[1]) = ' + flag)
        flag = true
      }
      else {
        flag = false
      }
    },
    onLeave: function (returnValue) {
      if (flag) {
        send('onLeave (returnValue) = ' + returnValue.toInt32())
      }
    }
  })
}


function ndkHookingHardWay (libName = 'libnative-lib.so') {
  const exports = Module.enumerateExports(libName)
  const decryptString = exports.find(({ name }) => name.includes('decryptString'))
  const JavaString = Java.use('java.lang.String')
  Interceptor.attach(decryptString.address, {
    onEnter: function (args) {
      const str = Java.cast(ptr(args[2]), JavaString)
      send('onEnter (args[2]) = ' + str)
      send('onEnter (args[3]) = ' + args[3].toInt32())
    },
    onLeave: function (pointer) {
      const returnValue = Java.cast(ptr(pointer), JavaString)
      send('onLeave (returnValue) = ' + returnValue)
    }
  })
}


function ndkHookingParams (libName = 'libnative-lib.so') {
  const exports = Module.enumerateExports(libName)
  const decryptString = exports.find(({ name }) => name.includes('decryptString'))
  Interceptor.attach(decryptString.address, {
    onEnter: function (args) {
      args[2] = Java.vm.getEnv().newStringUtf('Naruto Uzumaki')
      args[3] = ptr(args[3].toInt32() + 1)
      send('onEnter (args[2]) = ' + args[2])
      send('onEnter (args[3]) = ' + args[3])
    },
    onLeave: function (returnValue) {
      returnValue.replace(Java.vm.getEnv().newStringUtf('Sasuke Uchiha'))
      send('onLeave (returnValue) = ' + returnValue)
    }
  })
}