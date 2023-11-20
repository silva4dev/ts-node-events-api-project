/*
  Mock - É um duple de teste que está preocupado com input e com as
  criações de variáveis auxiliares que ajudam a comprovar se realmente
  o método foi chamado com o parâmetro correto.

  Stub - É um duple de teste que está preocupado com output ou seja
  com retorno de dados.

  Spy - É um duple de teste que se parece com o Mock, porém ele se preocupa
  também com output ou seja com retorno de dados.
*/

class CheckLastEventStatus {
  constructor (
    private readonly loadLastEventRepository: LoadLastEventRepository
  ) {}

  async perform (groupId: string): Promise<string> {
    await this.loadLastEventRepository.loadLastEvent(groupId)
    return 'done'
  }
}

interface LoadLastEventRepository {
  loadLastEvent: (groupId: string) => Promise<undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output = undefined

  async loadLastEvent (groupId: string): Promise<undefined> {
    this.groupId = groupId
    this.callsCount++
    return this.output
  }
}

type SutOutput = {
  sut: CheckLastEventStatus
  loadLastEventRepository: LoadLastEventRepositorySpy
}

const makeSut = (): SutOutput => {
  const loadLastEventRepository = new LoadLastEventRepositorySpy()
  const sut = new CheckLastEventStatus(loadLastEventRepository)
  return {
    sut,
    loadLastEventRepository
  }
}

describe('CheckLastEventStatus', () => {
  it('should get last event data', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform('any_group_id')

    expect(loadLastEventRepository.groupId).toBe('any_group_id')
    expect(loadLastEventRepository.callsCount).toBe(1)
  })

  it('should return status done when group has no event', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const status = await sut.perform('any_group_id')

    expect(status).toBe('done')
  })
})
