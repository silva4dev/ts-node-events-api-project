/*
  Mock - É um duple de teste que está preocupado com input e com as
  criações de variáveis auxiliares que ajudam a comprovar se realmente
  o método foi chamado com o parâmetro correto.

  Stub - É um duple de teste que está preocupado com output ou seja
  com retorno de dados.

  Spy - É um duple de teste que se parece com o Mock, porém ele se preocupa
  também com output ou seja com retorno de dados.

  Fake - É um duple de teste que está preocupado por implementar uma versão simplificada
  de um componente, usada em vez da implementação real para facilitar o teste.

  Dummy - É um duple de teste que está preocupado geralmente apenas para preencher
  parâmetros de métodos.
*/

import { set, reset } from 'mockdate'

class CheckLastEventStatus {
  constructor (
    private readonly loadLastEventRepository: LoadLastEventRepository
  ) {}

  async perform ({ groupId }: { groupId: string }): Promise<string> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupId })
    return event === undefined ? 'done' : 'active'
  }
}

interface LoadLastEventRepository {
  loadLastEvent: (input: { groupId: string }) => Promise<object | undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output?: object

  async loadLastEvent ({ groupId }: { groupId: string }): Promise<object | undefined> {
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
  const groupId = 'any_group_id'

  beforeAll(() => {
    set(new Date())
  })

  afterAll(() => {
    reset()
  })

  it('should get last event data', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform({ groupId })

    expect(loadLastEventRepository.groupId).toBe('any_group_id')
    expect(loadLastEventRepository.callsCount).toBe(1)
  })

  it('should return status done when group has no event', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const status = await sut.perform({ groupId })

    expect(status).toBe('done')
  })

  it('should return status active when now is before event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() + 1)
    }

    const status = await sut.perform({ groupId })

    expect(status).toBe('active')
  })
})
