var aggs={
  "size": 0,
  "aggs": {
    "pulpal": {
      "terms": {
        "field": "pulpalDiagnoses",
        "order": {
          "_term": "asc"
        },
        "size": 1000
      }
    },
    "apical": {
      "terms": {
        "field": "apicalDiagnoses",
        "order": {
          "_term": "asc"
        },
        "size": 1000
      }
    },
    "typeOfTreatment": {
      "terms": {
        "field": "typeOfTreatment",
        "order": {
          "_term": "asc"
        },
        "size": 1000
      }
    },
    "otherDiagnoses": {
      "terms": {
        "field": "otherDiagnoses",
        "order": {
          "_term": "asc"
        },
        "size": 1000
      }
    }

  }
}

var selectAgg={
  "size": 0,
  "aggs": {
    "agg": {
      "terms": {
        "field":"",
        "order": {
          "_term": "asc"
        },
        "size": 1000
      }
    }
  }
}