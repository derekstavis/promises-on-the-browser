(function () {
  var api = 'https://api.github.com'
  var target = document.getElementById('target')
  var search = document.getElementById('search')
  var loading = document.getElementById('loading')

  var reposUrl = function (organization) {
    return `${api}/orgs/${organization}/repos?access_token=971392b1942ed010f7f0dda8310b9d04baffff33&per_page=100`
  }

  var forksUrl = function (repo) {
    return `${api}/repos/${repo.owner.login}/${repo.name}/forks?access_token=971392b1942ed010f7f0dda8310b9d04baffff33`
  }

  var throwTimeoutError = function () {
    return Promise.reject(new Error('Request timed out'))
  }

  var buildTimeout =  function (delay) {
    return Promise.delay(delay)
      .then(throwTimeoutError)
  }

  var handleReturnCode = function (req) {
    if (req.ok) {
      return req
    } 
    
    throw new Error(req.statusText)
  }

  var responseToJson = function (res) {
    return res.json()
  }

  var request = function (...args) {
    return Promise.race([
      buildTimeout(1000),
      fetch(...args)
        .then(handleReturnCode)  
        .then(responseToJson)
    ]) 
  }

  var pickRepositoryData = function (repos) {
    return repos.map(function (repo) {
      return {
        name: repo.name,
        owner: repo.owner
       }
    })
  }

  var pickForkData = function (forks) {
    return forks.map(function (fork) {
      return {
        fullName: fork.full_name,
      }
    })
  }

  var mergeFork = function (repo) {
    return function (forks) {
      return {
        name: repo.name,
        owner: repo.owner,
        forks: forks
      }
    }
  }

  var fetchData = function (organization) {
    return fetchRepositories(organization)
      .then(attachForks)
  }

  var attachForks = function (repos) {
    if (!repos) return Promise.reject('No repos to attach fork!')

    return Promise.map(repos, function (repo) {
      return request(forksUrl(repo))
        .then(pickForkData)
        .then(mergeFork(repo))
    })
  }

  var fetchRepositories = function (organization) {
    if (!organization) return Promise.reject('No organization!')

    return request(reposUrl(organization))
      .then(pickRepositoryData)
      .catch(handleError)
  }

  var renderFork = function (fork) {
    return '<li>' + fork.fullName + '</li>'
  }

  var renderRepository = function (repo) {
    var forks = repo.forks.length > 0 ?
      '<ul>' +
        repo.forks.map(renderFork).join('') +
      '</ul>' : ''

    return (
      '<li>' +
        '<h3>' + repo.name + '</h3>' +
        forks +
      '</li>'
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
    return fetchData(organization)
      .then(renderRepositories)
      .then(updateTarget)
      .catch(handleError)
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
    console.dir(error)
    updateTarget(error.message || "No match")
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
