export class MyPromise {
  // static - чтобы не пересоздавать константы на каждое создание экземпляра
  static #PENDING = 'pending'
  static #FULFILLED = 'fulfilled'
  static #REJECTED = 'rejected'

  static #isThenable(value) {
    return (
      value !== null && value !== undefined && typeof value.then === 'function'
    )
  }

  #value
  #isResolved = false

  #reason
  #status = MyPromise.#PENDING

  #onFulfilledSubscribers = []
  #onRejectedSubscribers = []

  #runFulfilledCallbacks() {
    for (const subscriber of this.#onFulfilledSubscribers) {
      queueMicrotask(() => {
        subscriber(this.#value)
      })
    }

    this.#onFulfilledSubscribers = []
  }

  #runRejectedCallbacks() {
    for (const subscriber of this.#onRejectedSubscribers) {
      queueMicrotask(() => {
        subscriber(this.#reason)
      })
    }

    this.#onRejectedSubscribers = []
  }

  #handleResolveFunc(value) {
    this.#value = value
    this.#status = MyPromise.#FULFILLED
    this.#runFulfilledCallbacks()
  }

  #handleRejectFunc(reason) {
    this.#reason = reason
    this.#status = MyPromise.#REJECTED
    this.#runRejectedCallbacks()
  }

  #resolveFunc(value) {
    if (this.#isResolved) {
      return
    }

    this.#isResolved = true

    if (MyPromise.#isThenable(value)) {
      value.then(
        (response) => {
          this.#handleResolveFunc(response)
        },
        (error) => {
          this.#handleRejectFunc(error)
        },
      )
    } else {
      this.#handleResolveFunc(value)
    }
  }

  #rejectFunc(reason) {
    if (this.#isResolved) {
      return
    }

    this.#isResolved = true

    this.#handleRejectFunc(reason)
  }

  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error('executor is not a fucntion')
    }

    // The resolve function that is passed to an executor function accepts a single argument.
    // The executor is called with two arguments: resolve and reject.
    try {
      executor(this.#resolveFunc.bind(this), this.#rejectFunc.bind(this))
    } catch (error) {
      this.#rejectFunc(error)
    }
  }

  then(onFulfilled, onRejected) {
    let resolve, reject

    const promise = new this.constructor((originalResolve, originalReject) => {
      resolve = originalResolve
      reject = originalReject
    })

    this.#onFulfilledSubscribers.push((value) => {
      try {
        if (typeof onFulfilled !== 'function') {
          resolve(value)
        } else {
          const nextValue = onFulfilled(value)

          if (nextValue === this) {
            throw new TypeError('Chaining cycle detected for promise')
          }

          const isNextValueObject =
            typeof nextValue === 'object' && nextValue !== null
          if (!isNextValueObject) {
            resolve(nextValue)
            return
          }

          const then = nextValue.then

          if (typeof then !== 'function') {
            resolve(nextValue)
            return
          }

          then.apply(nextValue, [resolve, reject])

          // if (MyPromise.#isThenable(nextValue)) {
          //   nextValue.then(resolve, reject)
          // } else {
          //   resolve(nextValue)
          // }
        }
      } catch (error) {
        reject(error)
      }
    })

    this.#onRejectedSubscribers.push((error) => {
      if (typeof onRejected === 'function') {
        try {
          const nextValue = onRejected(error)

          if (nextValue === this) {
            throw new TypeError('Chaining cycle detected for promise')
          }

          resolve(nextValue)
        } catch (callbackError) {
          reject(callbackError)
        }
      } else {
        reject(error)
      }
    })

    // Call subscribers imidiatly if promise already resolved
    if (this.#status === MyPromise.#FULFILLED) {
      this.#runFulfilledCallbacks()
    }

    if (this.#status === MyPromise.#REJECTED) {
      this.#runRejectedCallbacks()
    }

    return promise
  }
}

// MyPromise.resolve = (x) => new MyPromise((r) => r(x))

// const promise = MyPromise.resolve('dummy').then(() => {
//   return {
//     get then() {
//       console.log('😈')
//       return function thenMethodForX(onFulfilled) {
//         onFulfilled()
//       }
//     },
//   }
// })

// promise.then(() => {})
