import { describe, test, expect } from 'vitest'
import { MyPromise } from './index.js'

describe('Методы экземплряра', () => {
  test('Существует метод then', () => {
    const promise = new MyPromise(() => {})
    expect(promise).toHaveProperty('then', expect.any(Function))
  })

  test('then возвращает MyPromise', () => {
    const promise = new MyPromise(() => {})

    const result = promise.then()

    expect(result).toBeInstanceOf(MyPromise)
  })

  // https://vitest.dev/guide/migration.html#done-callback
  describe('Первый коллбек then', () => {
    test('Принимает значение промиса', () => {
      return new Promise((done, notDone) => {
        const PROMISE_VALUE = 'PROMISE_VALUE'

        const promise = new MyPromise((resolve) => {
          resolve(PROMISE_VALUE)
        })

        promise.then((value) => {
          try {
            expect(value).toBe(PROMISE_VALUE)
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('В колбэке возвращается успешный промис', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, 'A')
        })

        promise
          .then(() => {
            return new MyPromise((resolve) => {
              setTimeout(resolve, 20, 'B')
            })
          })
          .then((value) => {
            try {
              expect(value).toBe('B')
              done()
            } catch (error) {
              notDone(error)
            }
          })
      })
    }, 200)

    test('В колбэке возвращается значение', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, 'A')
        })

        promise
          .then(() => {
            return 'B'
          })
          .then((value) => {
            try {
              expect(value).toBe('B')
              done()
            } catch (error) {
              notDone(error)
            }
          })
      })
    }, 50)

    test('В колбэке выбрасывается ошибка', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, 'A')
        })

        promise
          .then(() => {
            throw 'B'
          })
          .then(
            () => {},
            (reason) => {
              try {
                expect(reason).toBe('B')
                done()
              } catch (error) {
                notDone(error)
              }
            },
          )
      })
    }, 50)

    test('В колбэке возвращается реджектнутый промис', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, 'A')
        })

        promise
          .then(() => {
            return new MyPromise((_, reject) => {
              setTimeout(reject, 20, 'B')
            })
          })
          .then(
            () => {},
            (reason) => {
              try {
                expect(reason).toBe('B')
                done()
              } catch (error) {
                notDone(error)
              }
            },
          )
      })
    }, 200)

    test('Первый колбэк не передается', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, 'A')
        })

        promise.then().then((value) => {
          try {
            expect(value).toBe('A')
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('Вместо первого колбэка передается не функция', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, 'A')
        })

        promise.then(1234).then((value) => {
          try {
            expect(value).toBe('A')
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('Первый колбэк возвращает thenable объект', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, 'A')
        })

        promise
          .then(() => {
            return {
              then(onFulfilled) {
                setTimeout(onFulfilled, 20, 'B')
              },
            }
          })
          .then((value) => {
            try {
              expect(value).toBe('B')
              done()
            } catch (error) {
              notDone(error)
            }
          })
      })
    }, 200)
  })

  describe('Второй коллбек then', () => {
    test('Должен вызваться если в предыдущей цепочке произошла ошибка', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve, reject) => {
          setTimeout(reject, 20, 1)
        })

        promise.then(notDone, done)
      })
    }, 150)

    test('Должен переводить промис в статус "fulfilled" после обработки ошибки', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve, reject) => {
          setTimeout(reject, 20, 1)
        })

        promise
          .then(null, () => 2)
          .then((res) => {
            try {
              expect(res).toBe(2)
              done()
            } catch (error) {
              notDone(error)
            }
          })
      })
    }, 150)

    test('Должен переводить промис в статус "rejected" если в обработчике произошла ошибка с этой же самой ошибкой', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((_resolve, reject) => {
          setTimeout(reject, 20, 1)
        })

        promise
          .then(null, () => {
            throw 2
          })
          .then(null, (error) => {
            try {
              expect(error).toBe(2)
              done()
            } catch (error) {
              notDone(error)
            }
          })
      })
    }, 150)
  })
})

describe('Конструктор экзмемпляра', () => {
  describe('Первый аргумент – resolve', () => {
    test('Передаем значение → промис "fulfilled" с этим значением', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, 'A')
        })

        promise.then((res) => {
          try {
            expect(res).toBe('A')
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('Передаем thenable объект → промис "fulfilled" со значением внутри thenable', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, {
            then: (onFulfill) => onFulfill('A'),
          })
        })

        promise.then((res) => {
          try {
            expect(res).toBe('A')
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('Передаем "fulfilled" промис → промис "fulfilled" со значением внутри переданного промиса', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(resolve, 20, Promise.resolve('A'))
        })

        promise.then((res) => {
          try {
            expect(res).toBe('A')
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('Передаем "rejected" промис → промис "rejected" с причиной внутри переданного промиса', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve) => {
          setTimeout(() => {
            try {
              resolve(Promise.reject('A'))
            } catch {
              //
            }
          }, 20)
        })

        promise.then(null, (res) => {
          try {
            expect(res).toBe('A')
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 200)
  })

  describe('Второй аргумент reject', () => {
    test('Передаем значение → промис "rejected" с этим значением', () => {
      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve, reject) => {
          setTimeout(reject, 20, 'A')
        })

        promise.then(null, (reason) => {
          try {
            expect(reason).toBe('A')
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('Передаем thenable объект → промис "rejected" с этим thenable', () => {
      return new Promise((done, notDone) => {
        const rejectedValue = { then: (onF, onR) => onR('A') }

        const promise = new MyPromise((resolve, reject) => {
          setTimeout(reject, 20, rejectedValue)
        })

        promise.then(null, (reason) => {
          try {
            expect(reason).toBe(rejectedValue)
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('Передаем "fulfilled" промис → промис "rejected" с переданным промисом', () => {
      const rejectedValue = Promise.resolve('A')

      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve, reject) => {
          setTimeout(reject, 20, rejectedValue)
        })

        promise.then(null, (err) => {
          try {
            expect(err).toBe(rejectedValue)
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)

    test('Передаем "rejected" промис → промис "rejected" с переданным промисом', () => {
      const rejectedValue = Promise.reject('A')
      rejectedValue.catch(() => {})

      return new Promise((done, notDone) => {
        const promise = new MyPromise((resolve, reject) => {
          setTimeout(reject, 20, rejectedValue)
        })

        promise.then(null, (err) => {
          try {
            expect(err).toBe(rejectedValue)
            done()
          } catch (error) {
            notDone(error)
          }
        })
      })
    }, 50)
  })

  test('В конструкторе бросается значение → промис реджектится этим значением', () => {
    return new Promise((done, notDone) => {
      const promise = new MyPromise(() => {
        throw 'A'
      })

      promise.then(null, (err) => {
        try {
          expect(err).toBe('A')
          done()
        } catch (error) {
          notDone(error)
        }
      })
    })
  }, 50)

  describe('Повторный вызов resolve или reject', () => {
    describe('Второй вызов resolve после первого вызова resolve игнорируется', () => {
      test('resolve(1); resolve(2);  →  промис "fulfilled" значением 1', () => {
        return new Promise((done, notDone) => {
          const promise = new MyPromise((resolve) => {
            resolve(1)
            resolve(2)
          })

          promise.then((res) => {
            try {
              expect(res).toBe(1)
              done()
            } catch (error) {
              notDone(error)
            }
          })
        })
      }, 50)

      test('resolve(new MyPromise(resolve => setTimeout(resolve, 10, 1))); resolve(2);   →  промис "fulfilled" значением 1', () => {
        return new Promise((done, notDone) => {
          const promise = new MyPromise((resolve) => {
            resolve(new MyPromise((resolve) => setTimeout(resolve, 10, 1)))
            resolve(2)
          })

          promise.then((res) => {
            try {
              expect(res).toBe(1)
              done()
            } catch (error) {
              notDone(error)
            }
          })
        })
      }, 50)
    })
  })
})
