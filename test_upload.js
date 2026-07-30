async function test() {
  const payload = {
    location: "Asansol",
    category: "Children Residential",
    beneficiaryId: "test_upload_1",
    beneficiaryName: "Test Upload",
    photos: {
      profile: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      profile_thumb: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    }
  };
  const res = await fetch("https://script.google.com/macros/s/AKfycbx9UXCGv-zD8RtLv1wDIo9PB6Gk_bUo36vh2FQPwAEW-O9osNd6xaxTduUMqUo2vCsD/exec", {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  console.log(text);
}
test();
