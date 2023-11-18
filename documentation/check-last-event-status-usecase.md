# CheckLastEventStatus UseCase

## Dados
* Id do Grupo

## Fluxo primário
* Obter os dados da último evento do grupo (data de término e duração do mercado de notas)
* Retornar status "ativo" se o evento ainda não foi encerrado

## Fluxo alternativo: Evento está no limite do encerramento
* Retornar status "ativo"

## Fluxo alternativo: Evento encerrado, mas está dentro do período do mercado das notas
* Retornar status "em revisão"

## Fluxo alternativo: Evento e mercado das notas encerrados
* Retornar status "encerrado"
  
## Fluxo alternativo: Grupo não tem nenhum evento marcada
* Retornar status "encerrado"
