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

class EventStatus {
  status: 'active' | 'inReview' | 'done'

  constructor (event?: { endDate: Date, reviewDurationInHours: number }) {
    if (event === undefined) {
      this.status = 'done'
      return
    }
    const now = new Date()
    if (event.endDate >= now) {
      this.status = 'active'
      return
    }
    const reviewDurationInMs = event.reviewDurationInHours * 60 * 60 * 1000
    const reviewDate = new Date(event.endDate.getTime() + reviewDurationInMs)
    this.status = reviewDate >= now ? 'inReview' : 'done'
  }
}

class CheckLastEventStatus {
  constructor (
    private readonly loadLastEventRepository: LoadLastEventRepository
  ) {}

  async perform ({ groupId }: { groupId: string }): Promise<EventStatus> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupId })
    return new EventStatus(event)
  }
}

interface LoadLastEventRepository {
  loadLastEvent: (input: { groupId: string }) => Promise<{ endDate: Date, reviewDurationInHours: number } | undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output?: { endDate: Date, reviewDurationInHours: number }

  async loadLastEvent ({ groupId }: { groupId: string }): Promise<{ endDate: Date, reviewDurationInHours: number } | undefined> {
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
  beforeAll(() => set(new Date()))
  afterAll(() => reset())

  it('should get last event data', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    await sut.perform({ groupId })
    expect(loadLastEventRepository.groupId).toBe('any_group_id')
    expect(loadLastEventRepository.callsCount).toBe(1)
  })

  it('should return status done when group has no event', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined
    const eventStatus = await sut.perform({ groupId })
    expect(eventStatus.status).toBe('done')
  })

  it('should return status active when now is before event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() + 1),
      reviewDurationInHours: 1
    }
    const eventStatus = await sut.perform({ groupId })
    expect(eventStatus.status).toBe('active')
  })

  it('should return status active when now is equal to event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(),
      reviewDurationInHours: 1
    }
    const eventStatus = await sut.perform({ groupId })
    expect(eventStatus.status).toBe('active')
  })

  it('should return status inReview when now is after event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - 1),
      reviewDurationInHours: 1
    }
    const eventStatus = await sut.perform({ groupId })
    expect(eventStatus.status).toBe('inReview')
  })

  it('should return status inReview when now is before review time', async () => {
    const reviewDurationInHours = 1
    const reviewDurationInMs = reviewDurationInHours * 60 * 60 * 1000
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - reviewDurationInMs + 1),
      reviewDurationInHours
    }
    const eventStatus = await sut.perform({ groupId })
    expect(eventStatus.status).toBe('inReview')
  })

  it('should return status inReview when now equal to review time', async () => {
    const reviewDurationInHours = 1
    const reviewDurationInMs = reviewDurationInHours * 60 * 60 * 1000
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - reviewDurationInMs),
      reviewDurationInHours
    }
    const eventStatus = await sut.perform({ groupId })
    expect(eventStatus.status).toBe('inReview')
  })

  it('should return status done when now is after review time', async () => {
    const reviewDurationInHours = 1
    const reviewDurationInMs = reviewDurationInHours * 60 * 60 * 1000
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - reviewDurationInMs - 1),
      reviewDurationInHours
    }
    const eventStatus = await sut.perform({ groupId })
    expect(eventStatus.status).toBe('done')
  })
})
