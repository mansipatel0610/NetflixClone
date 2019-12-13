import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ItemGrid from './ItemGrid';
import { getTvDetails } from '../api/TmdbAPI';

const useStyles = makeStyles({
  paper: {
    maxWidth: '128rem',
    margin: '0 auto',
    backgroundColor: '#161616',
  },
  imgContainer: {
    height: '60rem',
    position: 'relative',
    padding: '4rem 6rem',
    display: 'flex',
    '&::before': {
      position: 'absolute',
      content: "' '",
      top: '0',
      bottom: '0',
      right: '0',
      left: '0',
      backgroundImage:
        'linear-gradient(to right, rgba(0,0,0,0.8),  rgba(0,0,0,0.8) 20%,rgba(0,0,0,0))',
    },
  },
  details: {
    color: 'white',
    zIndex: '1',
    maxWidth: '80rem',
  },
  title: {
    marginBottom: '1.5rem',
  },
  info: {
    marginBottom: '3rem',
    color: '#ccc',
  },
  overview: {
    fontFamily: 'Helvetica,sans-serif',
    marginBottom: '3rem',
  },
  container: {
    display: 'flex',
  },
  subtitle: {
    color: '#ccc',
    marginBottom: '0.5rem',
  },
  subcontent: {
    marginLeft: '0.5rem',
  },
  trailer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '2rem',
  },
  recommendations: {
    '&& > div': {
      paddingLeft: '0',
    },
  },
});

const TvDetails = () => {
  const classes = useStyles();

  const { id } = useParams();

  const [tv, setTv] = useState({});
  const [otherData, setOtherData] = useState({
    createdBy: [],
    genre: [],
    credits: [],
    rating: '',
    runtime: '',
    trailer: '',
    seasons: '',
  });

  useEffect(() => {
    setOtherData({
      createdBy: [],
      genre: [],
      credits: [],
      rating: '',
      runtime: '',
      trailer: '',
      seasons: '',
    });
    getTvDetails(id).then(({ data }) => {
      setTv(data);
      data.genres.forEach(item => {
        setOtherData(prevState => ({
          ...prevState,
          genre: [...prevState.genre, `${item.name}`],
        }));
      });

      data.credits.cast.slice(0, 3).forEach(item => {
        setOtherData(prevState => ({
          ...prevState,
          credits: [...prevState.credits, `${item.name}`],
        }));
      });
      if (data.vote_average !== 0) {
        setOtherData(prevState => ({
          ...prevState,
          rating: `| ${data.vote_average}`,
        }));
      }

      if (data.episode_run_time.length > 0) {
        setOtherData(prevState => ({
          ...prevState,
          runtime: `| ${data.episode_run_time[0]} mins`,
        }));
      }

      if (data.videos.results.length > 0) {
        setOtherData(prevState => {
          const trailers = data.videos.results.filter(result => result.type === 'Trailer');
          const trailer = trailers[0] ? `${trailers[0].key}` : `${data.videos.results[0].key}`;
          return {
            ...prevState,
            trailer,
          };
        });
      }

      data.created_by.forEach(item => {
        setOtherData(prevState => ({
          ...prevState,
          createdBy: [...prevState.createdBy, `${item.name}`],
        }));
      });

      setOtherData(prevState => ({
        ...prevState,
        seasons:
          data.number_of_seasons > 1
            ? `| ${data.number_of_seasons} Seasons`
            : `| ${data.number_of_seasons} Season`,
      }));
    });
  }, [id]);

  return (
    <Paper className={classes.paper}>
      <div className={classes.trailer}>
        <iframe
          src={`https://www.youtube.com/embed/${otherData.trailer}`}
          title="Trailer"
          width="1080"
          height="600"
          frameBorder="0"
        />
      </div>
      <div
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`,
        }}
        className={classes.imgContainer}
      >
        {tv.name ? (
          <div className={classes.details}>
            <Typography variant="h2" className={classes.title}>
              {`${tv.name}`}
            </Typography>
            <Typography variant="h5" className={classes.info}>
              {`${tv.first_air_date.slice(0, 4)} - ${tv.last_air_date.slice(0, 4)} ${
                otherData.rating
              } ${otherData.runtime} ${otherData.seasons}`}
            </Typography>
            <Typography variant="h5" className={classes.overview}>
              {`${tv.overview}`}
            </Typography>
            <div className={classes.container}>
              <Typography variant="h6" className={classes.subtitle}>
                Created By:
              </Typography>
              <Typography variant="h6" gutterBottom className={classes.subcontent}>
                {` ${otherData.createdBy.join(',')}`}
              </Typography>
            </div>
            <div className={classes.container}>
              <Typography variant="h6" className={classes.subtitle}>
                Starring:
              </Typography>
              <Typography variant="h6" gutterBottom className={classes.subcontent}>
                {` ${otherData.credits.join(',')}`}
              </Typography>
            </div>
            <div className={classes.container}>
              <Typography variant="h6" className={classes.subtitle}>
                Genres:
              </Typography>
              <Typography variant="h6" gutterBottom className={classes.subcontent}>
                {` ${otherData.genre.join(',')}`}
              </Typography>
            </div>
          </div>
        ) : null}
      </div>
      <div className={classes.recommendations}>
        {tv.recommendations ? (
          <ItemGrid items={tv.recommendations.results} type="tv" name="Recommendations" />
        ) : null}
      </div>
    </Paper>
  );
};

export default TvDetails;
