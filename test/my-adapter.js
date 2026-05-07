import promisesAplusTests from 'promises-aplus-tests'
// Импортируйте вашу реализацию промиса
import { MyPromise } from '../index.js'

const adapter = {
  // Метод resolved: должен вернуть уже выполненный (fulfilled) промис
  resolved: function (value) {
    // Если в вашей реализации есть статический метод, используйте его:
    // return MyPromise.resolve(value);

    // Или создайте через конструктор и сразу вызовите resolve
    return new MyPromise((resolve) => resolve(value))
  },

  // Метод rejected: должен вернуть уже отклоненный (rejected) промис
  rejected: function (reason) {
    // Если есть статический метод:
    // return MyPromise.reject(reason);

    return new MyPromise((_, reject) => reject(reason))
  },

  // Метод deferred: должен вернуть объект с промисом в состоянии pending
  // и функциями для управления им
  deferred: function () {
    let resolve, reject

    const promise = new MyPromise((res, rej) => {
      resolve = res
      reject = rej
    })

    return {
      promise: promise,
      resolve: resolve,
      reject: reject,
    }
  },
}

promisesAplusTests(adapter, function (err) {
  if (err) {
    console.error('Tests failed')
    console.error(err)
  } else {
    console.log('All tests passed!')
  }
})
