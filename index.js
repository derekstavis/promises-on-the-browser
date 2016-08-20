(function () {
  var api = 'https://api.github.com'
  var target = document.getElementById('target')
  var search = document.getElementById('search')
  var loading = document.getElementById('loading')

  console.log(loading)

  var reposUrl = function (organization) {
    return [ api, 'orgs', organization, 'repos?per_page=100' ].join('/')
  }

  var collaboratorsUrl = function (repo) {
    return [ api, 'repos', repo.owner.login, repo.name, 'collaborators' ].join('/')
  }

  var responseToJson = function (res) {
    return res.json()
  }

  var fetchRepositories = function (organization) {
    return fetch(reposUrl(organization))
      .then(responseToJson)
  }

  var filterRepositoriesProperties = function (repositories) {
    return repositories.map(filterRepositoryProperties)
  }

  var renderRepository = function (repo) {
    return (
      '<div class="repository">' +
        '<h3>' + repo.name + '</h3>' +
      '</div>'
    )
  }

  var renderRepositories = function (repos) {
    return (
      '<ul>' +
        repos.map(renderRepository).join('') +
      '</ul>'
    )
  }

  var updateTarget = function (content) {
    target.innerHTML = content
  }

  var updateSearch = function (organization) {
    return fetchRepositories(organization)
      .then(renderRepositories)
      .then(updateTarget)
  }

  var updateLoadingState = function (isLoading) {
    if (isLoading) {
      search.disabled = true
      loading.style.display = 'inline'
    } else {
      search.disabled = false
      loading.style.display = 'none'
    }
  }

  var handleError = function (error) {
    updateLoadingState(false)
    updateTarget('No matches')
  }

  var handleSuccess = function (error) {
    updateLoadingState(false)
  }

  var handleChange = function (event) {
    var value = event.target.value
    if (!value || value === '') return
    updateLoadingState(true)
    updateSearch(value)
      .then(handleSuccess)
      .catch(handleError)
  }

  search.addEventListener('change', handleChange)

})()
