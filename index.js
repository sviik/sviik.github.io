
const onUpdateInformation = (customAttributesUpdateMethod, btn) => {
  const information = JSON.parse(document.getElementById('updateInformation').value);
  const originalText = btn.textContent;
  btn.disabled = true;

  sm.getApi({version: 'v1'}).then(glia => {
    glia.updateInformation({...information, customAttributesUpdateMethod})
      .then(() => {
        btn.textContent = 'Updated';
        btn.classList.add('success');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('success');
          btn.disabled = false;
        }, 2000);
      })
      .catch(() => {
        btn.textContent = 'Error';
        btn.classList.add('error');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('error');
          btn.disabled = false;
        }, 2000);
      });
  });
};

const defaultVisitorInformation = `{
  "name": "new name",
  "phone": "+155555555",
  "email": "example@example.com",
  "note": "new note",
  "customAttributes": {
    "key": "value"
  },
  "externalId": "abc123"
}`;

const boot = () => {
  document.getElementById('updateInformation').value = defaultVisitorInformation;
};

const externalSessionId = (new URLSearchParams(window.location.search)).get('external_session_id');

window.getGliaContext = () => {
  return {
    sessionId: externalSessionId
  };
};

window.addEventListener('load', boot);
