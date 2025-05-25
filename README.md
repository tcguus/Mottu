# Mottu App — Gerenciamento de Frotas e Manutenção de Motos

> **IMPORTANTE:** Para o melhor funcionamento do projeto, recomenda-se utilizar o **emulador Pixel 6 Pro** no Android Studio, pois ele oferece a melhor compatibilidade visual com os componentes utilizados, especialmente os modais e mapas.

## Descrição do Projeto

Este aplicativo foi desenvolvido com **React Native + Expo** para simular o sistema interno da empresa **Mottu**, especializada em locação de motos. O sistema permite o **cadastro, gerenciamento, localização e manutenção das motos** em um pátio digital e geográfico, com diversas integrações visuais e funcionais.

---

## Funcionalidades Gerais

### **1. Tela de Login**
- Acesso controlado com autenticação por perfil (Gerente e Operador).
  - Login do Gerente: ID - 12345  |  Senha - 12345
  - Login do Operador: ID - 54321  |  Senha - 54321
- Redirecionamento automático para a tela principal de motos após login.

### **2. Cadastro de Motos**
- Adição de motos com:
  - Placa (formato com máscara `ABC-1234`)
  - Modelo (Pop, Sport ou -E)
  - Chassi (VIN)
  - Ano
- Motos são persistidas via **AsyncStorage**.
- Modal inferior para cadastro com imagem respectiva do modelo.
- Após cadastrar, a moto aparece automaticamente nas outras telas relevantes (localização, pátio, manutenção).

---

### **3. Tela de Manutenção**
- Permite criar pedidos de manutenção para qualquer moto cadastrada.
- Campos:
  - Moto (DropdownPicker)
  - Data (DateTimePicker)
  - Tipo de manutenção (lista com várias opções)
  - Descrição do problema
- Cada pedido aparece no histórico com o ícone de **hourglass-outline** (pendente).
- Os pedidos mais recentes aparecem no topo.
- Modal de visualização detalhada da manutenção com opção de:
  - ✅ Confirmar manutenção (status atualizado e ícone de checkmark)
  - ❌ Excluir manutenção (status atualizado e ícone de close)

---

### **4. Tela de Localização**
- Integração com **Google Maps**.
- As motos cadastradas (exceto as em manutenção pendente) são distribuídas **aleatoriamente dentro de um raio de 10km em São Paulo** (`Rua Agostinho Cantu, 209`).
- Cada moto aparece no mapa com sua imagem correspondente.
- Modal interativo ao clicar no marcador ou selecionar via DropdownPicker:
  - Detalhes: placa, modelo, chassi e ano.
- O mapa realiza um **zoom automático** na moto selecionada.
- As motos aparecem com título por 3 segundos ao serem clicadas ou selecionadas.
- Dropdown com todas as motos em tempo real.

---

### **5. Pátio Digital**
- Simula a organização visual do pátio da Mottu.
- Layout:
  - Colunas com borda **verde** para motos disponíveis.
  - Coluna com borda **amarela** para motos em manutenção.
- Funcionalidades:
  - **Drag & Drop funcional**: segure e arraste para mover a moto de uma vaga para outra.
  - Ao clicar em uma moto, abre um **modal com as informações completas**:
    - Placa, modelo, ano, chassi
    - Se estiver em manutenção: tipo e descrição do problema
  - DropdownPicker com todas as motos disponíveis para facilitar a busca:
    - A moto selecionada **pisca em verde** por alguns segundos para facilitar sua localização.

---

## Tecnologias Utilizadas

- **React Native**
- **Expo + Expo Router**
- **AsyncStorage** (persistência local)
- **react-native-maps** (Google Maps)
- **@react-native-picker/picker**
- **DropDownPicker**
- **DateTimePicker**
- **Ionicons (Expo vector icons)**

---

## Comandos Úteis

### Rodar o projeto
```bash
npm install
```

```bash
npx expo start
```

---

## Integração entre Telas

| Origem            | Destino             | Ação                                                                 |
|-------------------|---------------------|----------------------------------------------------------------------|
| Cadastro de Motos | Localização         | Moto aparece automaticamente no mapa após cadastro                   |
| Cadastro de Motos | Pátio Digital       | Moto adicionada às vagas automaticamente                             |
| Cadastro de Motos | Manutenção          | Moto aparece no Dropdown de seleção para manutenção                  |
| Manutenção        | Localização         | Moto com manutenção pendente **não aparece** no mapa                 |
| Manutenção        | Pátio Digital       | Moto em manutenção é movida automaticamente para a coluna amarela    |

---

## Nossos integrantes
- **Gustavo Camargo de Andrade**
- RM555562
- 2TDSPF
-------------------------------------------
- **Rodrigo Souza Mantovanello**
- RM555451
- 2TDSPF
-------------------------------------------
- **Leonardo Cesar Rodrigues Nascimento**
- RM558373
- 2TDSPF
