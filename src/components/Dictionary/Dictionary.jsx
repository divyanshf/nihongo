import { ArrowForward } from "@mui/icons-material";
import {
    Box,
    IconButton,
    InputBase,
    LinearProgress,
    Link as MLink,
    Typography,
    useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Kanji from "../Kanji/Kanji";

const Dictionary = () => {
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    let query = searchParams.get("query");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(query || "");
    const navigate = useNavigate();

    // Fetch Search Results from Jisho.org
    const fetchData = async (query, abortController) => {
        const res = await fetch(
            "https://kanjialive-api.p.rapidapi.com/api/public/search/advanced?kem=" +
                query,
            {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
                    "X-RapidAPI-Host": "kanjialive-api.p.rapidapi.com",
                },
                signal: abortController.signal,
            }
        );
        if (res.ok) {
            return await res.json();
        } else throw new Error(res.status);
    };

    // Handle value change
    const handleChange = (e) => {
        setSearch(e.target.value.toLowerCase());
    };

    // Handle key down
    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            setLoading(true);
            startSearch();
        }
    };

    // Start the search
    const startSearch = () => {
        if (search) {
            navigate("/dictionary?query=" + search);
        }
    };

    // Uppercase the first letter
    const firstLetterUpper = (query) => {
        return query[0].toUpperCase() + query.substr(1);
    };

    // On search params change
    useEffect(() => {
        let abortController = new AbortController();

        if (query) {
            setLoading(true);
            setData([]);
            fetchData(query, abortController)
                .then((res) => {
                    setLoading(false);
                    setData(res);
                    console.log(res);
                })
                .catch((err) => {
                    // setLoading(false);
                    console.log(err);
                });
        }

        return () => {
            abortController.abort();
        };
    }, [query]);

    return (
        <Box>
            <Box>
                <Typography variant="h3" color="text.primary">
                    Kanji Dict
                </Typography>
                <Typography variant="caption" color="text.primary">
                    (Powered by{" "}
                    <MLink href="https://app.kanjialive.com/">
                        Kanji Alive
                    </MLink>
                    )
                </Typography>
            </Box>
            <Box sx={{ my: 3 }}>
                <Box display="flex" alignItems="center">
                    <Box sx={{ width: "100%", maxWidth: "500px" }}>
                        <InputBase
                            value={search}
                            placeholder={"Search a english word"}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            sx={(theme) => ({
                                borderBottom: 1,
                                width: "100%",
                                borderColor: theme.palette.text.disabled,
                                "&:active": {
                                    borderColor: theme.palette.primary.main,
                                },
                            })}
                        />
                        {loading && <LinearProgress sx={{ height: "1px" }} />}
                    </Box>
                    <IconButton>
                        <ArrowForward />
                    </IconButton>
                </Box>
            </Box>
            <Box>
                {!loading && data.length === 0 ? (
                    <Typography color="error">
                        No kanji exists for the word "{query}"
                    </Typography>
                ) : !loading ? (
                    <>
                        <Typography
                            color="text.primary"
                            variant="h5"
                            sx={{ mb: 1 }}
                        >
                            {firstLetterUpper(query)}
                        </Typography>
                        <Box>
                            {data.map((kanji, idx) => (
                                <Kanji
                                    kanji={kanji.kanji.character}
                                    key={idx}
                                />
                            ))}
                        </Box>
                    </>
                ) : null}
            </Box>
        </Box>
    );
};

export default Dictionary;
